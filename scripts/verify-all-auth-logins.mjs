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

async function latestBackupDir() {
  const entries = await readdir('backups', { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('firestore-'))
    .map((entry) => entry.name)
    .sort();
  if (!dirs.length) throw new Error('Nenhum backup encontrado em backups/.');
  return join('backups', dirs.at(-1));
}

async function loadUsers() {
  const dir = await latestBackupDir();
  const raw = await readFile(join(dir, 'segurancas.json'), 'utf8');
  return JSON.parse(raw).map((item) => ({ id: item.id, ...item.data }));
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
