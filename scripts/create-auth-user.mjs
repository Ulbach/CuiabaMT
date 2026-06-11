import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
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

const allowedProfiles = new Set(['ADMIN', 'OPERADOR', 'CONSULTA']);
const email = String(process.env.NEW_USER_EMAIL || '').trim().toLowerCase();
const password = String(process.env.NEW_USER_PASSWORD || '').trim();
const nome = String(process.env.NEW_USER_NAME || '').trim().toUpperCase();
const perfil = String(process.env.NEW_USER_PROFILE || 'OPERADOR').trim().toUpperCase();
const dryRun = process.env.DRY_RUN === '1';

if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('NEW_USER_EMAIL invalido.');
if (!/^\d{6}$/.test(password)) throw new Error('NEW_USER_PASSWORD deve ter 6 digitos numericos.');
if (!nome) throw new Error('NEW_USER_NAME obrigatorio.');
if (!allowedProfiles.has(perfil)) throw new Error('NEW_USER_PROFILE deve ser ADMIN, OPERADOR ou CONSULTA.');

async function backupDirsNewestFirst() {
  const entries = await readdir('backups', { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('firestore-'))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  if (!dirs.length) throw new Error('Nenhum backup encontrado em backups/.');
  return dirs.map((dir) => join('backups', dir));
}

async function loadSuperAdmin() {
  for (const dir of await backupDirsNewestFirst()) {
    try {
      const raw = await readFile(join(dir, 'segurancas.json'), 'utf8');
      const users = JSON.parse(raw).map((item) => ({ id: item.id, ...item.data }));
      const user = users.find((item) => item.Ativo === true && item.SuperAdmin === true && item.Email && item.Sen_Segura);
      if (user) return user;
    } catch (_) {
      // Ignore failed/incomplete backup folders.
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
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Erro ao criar usuario Auth: ${payload?.error?.message || response.status}`);
  }

  return payload.localId;
}

function maskEmail(value) {
  return value.replace(/^(.).+(@.+)$/, '$1***$2');
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const superAdmin = await loadSuperAdmin();

if (dryRun) {
  console.log(JSON.stringify({
    dryRun: true,
    valid: true,
    email: maskEmail(email),
    perfil,
    superAdminBackupFound: true
  }, null, 2));
  process.exit(0);
}

const uid = await createAuthUser();

await signInWithEmailAndPassword(auth, superAdmin.Email, String(superAdmin.Sen_Segura));

const segurancaRef = await addDoc(collection(db, 'segurancas'), {
  Ativo: true,
  AuthMigrado: true,
  AuthUid: uid,
  Email: email,
  Nome: nome,
  NomeBusca: nome,
  Perfil: perfil,
  Protegido: false,
  SuperAdmin: false,
  CredencialPrivada: false,
  BloquearAlteracaoPorOutroAdmin: false,
  CriadoEm: serverTimestamp(),
  AtualizadoEm: serverTimestamp()
});

await setDoc(doc(db, 'usuarios_auth', uid), {
  uid,
  segurancaId: segurancaRef.id,
  Email: email,
  Nome: nome,
  NomeBusca: nome,
  Perfil: perfil,
  Ativo: true,
  Protegido: false,
  SuperAdmin: false,
  CredencialPrivada: false,
  CriadoPorScript: true,
  AtualizadoEm: serverTimestamp()
});

await addDoc(collection(db, 'auditoria'), {
  tipo: 'CRIACAO_USUARIO_AUTH',
  alvoColecao: 'usuarios_auth',
  alvoId: uid,
  usuarioUid: superAdmin.AuthUid || '',
  usuarioEmail: superAdmin.Email || '',
  usuarioNome: superAdmin.Nome || '',
  origem: 'scripts/create-auth-user.mjs',
  detalhes: {
    segurancaId: segurancaRef.id,
    perfil
  },
  criadoEm: serverTimestamp()
});

await signOut(auth).catch(() => {});

console.log(JSON.stringify({
  created: true,
  uid,
  segurancaId: segurancaRef.id,
  email: maskEmail(email),
  perfil
}, null, 2));
