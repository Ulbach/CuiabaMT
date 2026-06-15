import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  where
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

const email = String(process.env.SECURITY_EMAIL || '').trim().toLowerCase();

if (!/^\S+@\S+\.\S+$/.test(email)) {
  throw new Error('Informe SECURITY_EMAIL com um e-mail valido.');
}

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

function compactSecurity(item) {
  return {
    id: item.id,
    Email: item.Email || '',
    Nome: item.Nome || '',
    Perfil: item.Perfil || '',
    Ativo: item.Ativo === true,
    AuthUid: item.AuthUid || '',
    MustChangePassword: item.MustChangePassword === true,
    SuperAdmin: item.SuperAdmin === true,
    Protegido: item.Protegido === true
  };
}

function compactProfile(item) {
  return {
    uid: item.id,
    Email: item.Email || '',
    Nome: item.Nome || '',
    Perfil: item.Perfil || '',
    Ativo: item.Ativo === true,
    segurancaId: item.segurancaId || '',
    MustChangePassword: item.MustChangePassword === true,
    SuperAdmin: item.SuperAdmin === true,
    Protegido: item.Protegido === true
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const superAdmin = await loadSuperAdmin();

await signInWithEmailAndPassword(auth, superAdmin.Email, String(superAdmin.Sen_Segura));

const securitySnap = await getDocs(query(collection(db, 'segurancas'), where('Email', '==', email), limit(20)));
const securities = securitySnap.docs.map((snap) => ({ id: snap.id, ...snap.data() }));

const profileSnap = await getDocs(query(collection(db, 'usuarios_auth'), where('Email', '==', email), limit(20)));
const profilesByEmail = profileSnap.docs.map((snap) => ({ id: snap.id, ...snap.data() }));

const profilesByUid = [];
for (const item of securities) {
  if (!item.AuthUid) continue;
  const profileDoc = await getDoc(doc(db, 'usuarios_auth', item.AuthUid));
  if (profileDoc.exists()) profilesByUid.push({ id: profileDoc.id, ...profileDoc.data() });
}

const allProfiles = new Map();
for (const item of [...profilesByEmail, ...profilesByUid]) allProfiles.set(item.id, item);

const issues = [];
if (!securities.length) issues.push('Nenhum documento encontrado em segurancas para este e-mail.');
if (!allProfiles.size) issues.push('Nenhum perfil encontrado em usuarios_auth para este e-mail/AuthUid.');
if (securities.length > 1) issues.push('Existe mais de um cadastro em segurancas com este e-mail.');
if (allProfiles.size > 1) issues.push('Existe mais de um perfil em usuarios_auth ligado a este e-mail/AuthUid.');

for (const security of securities) {
  if (!security.AuthUid) issues.push(`segurancas/${security.id} nao possui AuthUid.`);
  if (security.Ativo !== true) issues.push(`segurancas/${security.id} esta inativo.`);
  if (security.AuthUid && !allProfiles.has(security.AuthUid)) {
    issues.push(`usuarios_auth/${security.AuthUid} nao existe para o AuthUid do cadastro.`);
  }
}

for (const profile of allProfiles.values()) {
  const linkedSecurity = securities.find((item) => item.id === profile.segurancaId);
  const linkedByUid = securities.find((item) => item.AuthUid === profile.id);
  if (!profile.segurancaId) issues.push(`usuarios_auth/${profile.id} nao possui segurancaId.`);
  if (profile.segurancaId && !linkedSecurity) issues.push(`usuarios_auth/${profile.id} aponta para segurancaId inexistente nesta consulta.`);
  if (!linkedByUid) issues.push(`Nenhum cadastro em segurancas aponta AuthUid=${profile.id}.`);
  if (profile.Ativo !== true) issues.push(`usuarios_auth/${profile.id} esta inativo.`);
  if (!profile.Perfil) issues.push(`usuarios_auth/${profile.id} esta sem Perfil.`);
}

await signOut(auth).catch(() => {});

console.log(JSON.stringify({
  email,
  projectId: firebaseConfig.projectId,
  securities: securities.map(compactSecurity),
  authProfiles: [...allProfiles.values()].map(compactProfile),
  issues,
  diagnosis: issues.length ? 'VERIFICAR_OU_REPARAR' : 'OK'
}, null, 2));
