import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBeG7uirpSS3N0I48fy7WqJa_SSrb8A-48',
  authDomain: 'cuiaba-01617931-f126e.firebaseapp.com',
  projectId: 'cuiaba-01617931-f126e',
  storageBucket: 'cuiaba-01617931-f126e.firebasestorage.app',
  messagingSenderId: '797115279316',
  appId: '1:797115279316:web:f229366de16d4e066e1841'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePerfil(value) {
  return String(value || 'OPERADOR').trim().toUpperCase();
}

async function ensureAuthUser(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { uid: cred.user.uid, created: true };
  } catch (error) {
    if (error.code !== 'auth/email-already-in-use') throw error;
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { uid: cred.user.uid, created: false };
  }
}

const snap = await getDocs(query(collection(db, 'segurancas'), where('Ativo', '==', true)));
const results = [];

for (const item of snap.docs) {
  const data = item.data();
  const email = normalizeEmail(data.Email);
  const password = String(data.Sen_Segura || '').trim();

  if (!email || !/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(password)) {
    results.push({ segurancaId: item.id, email: email || null, skipped: true, reason: 'email-or-password-invalid' });
    continue;
  }

  const authUser = await ensureAuthUser(email, password);
  const perfil = normalizePerfil(data.Perfil);
  const uid = authUser.uid;

  await setDoc(doc(db, 'usuarios_auth', uid), {
    uid,
    segurancaId: item.id,
    Email: email,
    Nome: data.Nome || '',
    NomeBusca: data.NomeBusca || String(data.Nome || '').trim().toUpperCase(),
    Perfil: perfil,
    Ativo: data.Ativo === true,
    Protegido: data.Protegido === true,
    SuperAdmin: data.SuperAdmin === true,
    CredencialPrivada: data.CredencialPrivada === true,
    MustChangePassword: true,
    CriadoPorMigracao: true,
    AtualizadoEm: serverTimestamp()
  }, { merge: true });

  await updateDoc(doc(db, 'segurancas', item.id), {
    AuthUid: uid,
    AuthMigrado: true,
    MustChangePassword: true,
    AtualizadoEm: serverTimestamp()
  });

  results.push({
    segurancaId: item.id,
    uid,
    email,
    perfil,
    created: authUser.created,
    migrated: true
  });
}

await signOut(auth).catch(() => {});

console.log(JSON.stringify({
  migrated: results.filter((item) => item.migrated).length,
  skipped: results.filter((item) => item.skipped).length,
  results: results.map((item) => ({
    ...item,
    email: item.email ? item.email.replace(/^(.).+(@.+)$/, '$1***$2') : item.email
  }))
}, null, 2));
