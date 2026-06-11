import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const superAdmin = await loadSuperAdmin();

await signInWithEmailAndPassword(auth, superAdmin.Email, String(superAdmin.Sen_Segura));
const snap = await getDocs(collection(db, 'segurancas'));
const withLegacyField = snap.docs
  .filter((item) => Object.prototype.hasOwnProperty.call(item.data(), 'Sen_Segura'))
  .map((item) => item.id);
await signOut(auth).catch(() => {});

console.log(JSON.stringify({
  ok: withLegacyField.length === 0,
  checked: snap.size,
  withLegacyField
}, null, 2));

if (withLegacyField.length) process.exit(1);
