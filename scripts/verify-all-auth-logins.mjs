import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
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

async function loadUsers() {
  for (const dir of await backupDirsNewestFirst()) {
    try {
      const raw = await readFile(join(dir, 'segurancas.json'), 'utf8');
      const users = JSON.parse(raw).map((item) => ({ id: item.id, ...item.data }));
      if (users.some((user) => user.Ativo === true && user.Email && user.Sen_Segura)) return users;
    } catch (_) {
      // Ignore failed/incomplete backup folders.
    }
  }
  throw new Error('Nenhum backup com credenciais legadas encontrado para teste de login Auth.');
}

function maskEmail(email) {
  return String(email || '').replace(/^(.).+(@.+)$/, '$1***$2');
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const users = (await loadUsers()).filter((user) => user.Ativo === true);
const results = [];

for (const user of users) {
  try {
    const cred = await signInWithEmailAndPassword(auth, user.Email, String(user.Sen_Segura));
    const profile = await getDoc(doc(db, 'usuarios_auth', cred.user.uid));
    results.push({
      email: maskEmail(user.Email),
      uid: cred.user.uid,
      perfil: profile.exists() ? profile.data().Perfil : null,
      ok: profile.exists() && profile.data().Ativo === true
    });
  } catch (error) {
    results.push({
      email: maskEmail(user.Email),
      ok: false,
      error: error.code || error.message
    });
  } finally {
    await signOut(auth).catch(() => {});
  }
}

const failed = results.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, total: results.length, results }, null, 2));
if (failed.length) process.exit(1);
