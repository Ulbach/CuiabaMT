import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  deleteField,
  getDocs,
  getFirestore,
  serverTimestamp,
  updateDoc,
  doc
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function latestBackupDir() {
  const entries = await readdir('backups', { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('firestore-'))
    .map((entry) => entry.name)
    .sort();
  if (!dirs.length) throw new Error('Nenhum backup encontrado em backups/.');
  return join('backups', dirs.at(-1));
}

async function loadSuperAdmin() {
  const dir = await latestBackupDir();
  const raw = await readFile(join(dir, 'segurancas.json'), 'utf8');
  const users = JSON.parse(raw).map((item) => ({ id: item.id, ...item.data }));
  const user = users.find((item) => item.Ativo === true && item.SuperAdmin === true);
  if (!user) throw new Error('SuperAdmin nao encontrado no backup local.');
  return user;
}

const superAdmin = await loadSuperAdmin();
await signInWithEmailAndPassword(auth, superAdmin.Email, String(superAdmin.Sen_Segura));

const snap = await getDocs(collection(db, 'segurancas'));
const updated = [];

for (const item of snap.docs) {
  const data = item.data();
  if (!Object.prototype.hasOwnProperty.call(data, 'Sen_Segura')) continue;

  await updateDoc(doc(db, 'segurancas', item.id), {
    Sen_Segura: deleteField(),
    SenhaLegadaRemovidaEm: serverTimestamp(),
    AtualizadoEm: serverTimestamp()
  });

  updated.push(item.id);
}

await signOut(auth).catch(() => {});
console.log(JSON.stringify({ removedField: 'Sen_Segura', count: updated.length, ids: updated }, null, 2));
