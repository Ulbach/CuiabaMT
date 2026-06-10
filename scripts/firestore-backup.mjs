import { initializeApp } from 'firebase/app';
import {
  collection,
  getDocs,
  getFirestore
} from 'firebase/firestore';
import { mkdir, writeFile } from 'node:fs/promises';
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
  'visitantes',
  'frota_veiculos',
  'frota_motoristas'
];

const sensitiveFieldPattern = /(senha|sen_|password|token|secret|credencial)/i;
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

await writeFile(
  join(backupDir, 'manifest.sanitized.json'),
  JSON.stringify(manifest, null, 2),
  'utf8'
);

console.log(JSON.stringify({ backupDir, manifest }, null, 2));
