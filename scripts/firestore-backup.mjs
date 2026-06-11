import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  getDocs,
  getFirestore
} from 'firebase/firestore';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const firebaseConfig = {
  apiKey: 'AIzaSyBeG7uirpSS3N0I48fy7WqJa_SSrb8A-48',
  authDomain: 'cuiaba-01617931-f126e.firebaseapp.com',
  projectId: 'cuiaba-01617931-f126e',
  storageBucket: 'cuiaba-01617931-f126e.firebasestorage.app',
  messagingSenderId: '797115279316',
  appId: '1:797115279316:web:f229366de16d4e066e1841'
};

const collections = [
  'segurancas',
  'veiculos',
  'motoristas',
  'responsaveis',
  'movimentacoes_frota',
  'logs_acesso',
  'usuarios_auth',
  'auditoria',
  'visitantes',
  'frota_veiculos',
  'frota_motoristas'
];

const sensitiveFieldPattern = /(senha|sen_|password|token|secret|credencial)/i;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function backupDirsNewestFirst() {
  const entries = await readdir('backups', { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('firestore-'))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  if (!dirs.length) throw new Error('Nenhum backup anterior encontrado para autenticar SuperAdmin.');
  return dirs.map((dir) => join('backups', dir));
}

async function loadSuperAdminFromBackup() {
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

function normalizeValue(value) {
  if (!value || typeof value !== 'object') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(normalizeValue);
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, normalizeValue(entry)])
  );
}

function summarizeDocs(docs) {
  const fields = new Set();
  const sensitiveFields = new Set();

  docs.forEach((doc) => {
    Object.keys(doc.data).forEach((field) => {
      fields.add(field);
      if (sensitiveFieldPattern.test(field)) sensitiveFields.add(field);
    });
  });

  return {
    count: docs.length,
    fields: Array.from(fields).sort(),
    sensitiveFieldsDetected: Array.from(sensitiveFields).sort()
  };
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = join('backups', `firestore-${stamp}`);

const superAdmin = await loadSuperAdminFromBackup();
await signInWithEmailAndPassword(auth, superAdmin.Email, String(superAdmin.Sen_Segura));
await mkdir(backupDir, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  projectId: firebaseConfig.projectId,
  warning: 'Raw backup files are local and may contain sensitive data. Do not commit backups/.',
  collections: {}
};

for (const name of collections) {
  const snap = await getDocs(collection(db, name));
  const docs = snap.docs.map((item) => ({
    id: item.id,
    data: normalizeValue(item.data())
  }));

  await writeFile(
    join(backupDir, `${name}.json`),
    JSON.stringify(docs, null, 2),
    'utf8'
  );

  manifest.collections[name] = summarizeDocs(docs);
}

await signOut(auth).catch(() => {});

await writeFile(
  join(backupDir, 'manifest.sanitized.json'),
  JSON.stringify(manifest, null, 2),
  'utf8'
);

console.log(JSON.stringify({ backupDir, manifest }, null, 2));
