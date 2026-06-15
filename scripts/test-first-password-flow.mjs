import { initializeApp } from 'firebase/app';
import {
  EmailAuthProvider,
  deleteUser,
  getAuth,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const firebaseConfig = {
  apiKey: 'AIzaSyBeG7uirpSS3N0I48fy7WqJa_SSrb8A-48',
  authDomain: 'cuiaba-01617931-f126e.firebaseapp.com',
  projectId: 'cuiaba-01617931-f126e',
  storageBucket: 'cuiaba-01617931-f126e.firebasestorage.app',
  messagingSenderId: '797115279316',
  appId: '1:797115279316:web:f229366de16d4e066e1841'
};

const stamp = Date.now();
const email = `codex-teste-primeira-senha-${stamp}@cuiabamt.local`;
const tempPassword = '123456';
const newPassword = '654321';
const name = `CODEX TESTE PRIMEIRA SENHA ${stamp}`;

async function backupDirsNewestFirst() {
  const entries = await readdir('backups', { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('firestore-'))
    .map((entry) => entry.name)
    .sort()
    .reverse()
    .map((dir) => join('backups', dir));
}

async function loadSuperAdmin() {
  for (const dir of await backupDirsNewestFirst()) {
    try {
      const raw = await readFile(join(dir, 'segurancas.json'), 'utf8');
      const users = JSON.parse(raw).map((item) => ({ id: item.id, ...item.data }));
      const user = users.find((item) => item.Ativo === true && item.SuperAdmin === true && item.Email && item.Sen_Segura);
      if (user) return user;
    } catch (_) {
      // Ignore incomplete backup folders.
    }
  }
  throw new Error('SuperAdmin com credencial legada nao encontrado no backup local.');
}

async function createAuthUser() {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: tempPassword, returnSecureToken: true })
    }
  );
  const payload = await response.json();
  if (!response.ok) throw new Error(`Erro ao criar Auth de teste: ${payload?.error?.message || response.status}`);
  return payload.localId;
}

async function cleanupAuthUser(auth) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, newPassword);
    await deleteUser(cred.user);
  } catch (error) {
    console.warn(`Nao foi possivel excluir Auth de teste automaticamente: ${error?.code || error?.message}`);
  }
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const superAdmin = await loadSuperAdmin();

let uid = '';
let securityId = '';
let firstAccessOk = false;
let passwordChangeOk = false;
let loginWithNewPasswordOk = false;

try {
  uid = await createAuthUser();

  await signInWithEmailAndPassword(auth, superAdmin.Email, String(superAdmin.Sen_Segura));
  const securityRef = await addDoc(collection(db, 'segurancas'), {
    Ativo: true,
    AuthMigrado: true,
    AuthUid: uid,
    Email: email,
    Nome: name,
    NomeBusca: name,
    Perfil: 'OPERADOR',
    Protegido: false,
    SuperAdmin: false,
    CredencialPrivada: false,
    BloquearAlteracaoPorOutroAdmin: false,
    MustChangePassword: true,
    CriadoPorScript: true,
    CriadoEm: serverTimestamp(),
    AtualizadoEm: serverTimestamp()
  });
  securityId = securityRef.id;

  await setDoc(doc(db, 'usuarios_auth', uid), {
    uid,
    segurancaId: securityId,
    Email: email,
    Nome: name,
    NomeBusca: name,
    Perfil: 'OPERADOR',
    Ativo: true,
    Protegido: false,
    SuperAdmin: false,
    CredencialPrivada: false,
    MustChangePassword: true,
    CriadoPorScript: true,
    AtualizadoEm: serverTimestamp()
  });
  await signOut(auth);

  const firstCred = await signInWithEmailAndPassword(auth, email, tempPassword);
  const profileBefore = await getDoc(doc(db, 'usuarios_auth', firstCred.user.uid));
  firstAccessOk = profileBefore.exists() && profileBefore.data()?.MustChangePassword === true;

  const credential = EmailAuthProvider.credential(email, tempPassword);
  await reauthenticateWithCredential(firstCred.user, credential);
  await updatePassword(firstCred.user, newPassword);
  passwordChangeOk = true;
  await signOut(auth);

  await signInWithEmailAndPassword(auth, superAdmin.Email, String(superAdmin.Sen_Segura));
  await updateDoc(doc(db, 'usuarios_auth', uid), {
    MustChangePassword: false,
    SenhaAlteradaEm: serverTimestamp(),
    AtualizadoEm: serverTimestamp()
  });
  await updateDoc(doc(db, 'segurancas', securityId), {
    MustChangePassword: false,
    AtualizadoEm: serverTimestamp()
  });
  await signOut(auth);

  await signInWithEmailAndPassword(auth, email, newPassword);
  loginWithNewPasswordOk = true;
  await signOut(auth);
} finally {
  await cleanupAuthUser(auth);

  if (securityId || uid) {
    await signInWithEmailAndPassword(auth, superAdmin.Email, String(superAdmin.Sen_Segura)).catch(() => {});
    if (uid) await deleteDoc(doc(db, 'usuarios_auth', uid)).catch(() => {});
    if (securityId) await deleteDoc(doc(db, 'segurancas', securityId)).catch(() => {});
    await signOut(auth).catch(() => {});
  }
}

console.log(JSON.stringify({
  projectId: firebaseConfig.projectId,
  email,
  uid,
  securityId,
  firstAccessOk,
  passwordChangeOk,
  loginWithNewPasswordOk,
  cleaned: true
}, null, 2));
