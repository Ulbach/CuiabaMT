import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  serverTimestamp
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
  throw new Error('Nenhum backup com credenciais legadas encontrado para teste de regras.');
}

function userByPerfil(users, perfil) {
  const user = users.find((item) => item.Ativo === true && String(item.Perfil).toUpperCase() === perfil);
  if (!user) throw new Error(`Usuario de perfil ${perfil} nao encontrado no backup local.`);
  return user;
}

async function expectDenied(label, action) {
  try {
    await action();
    return { label, ok: false, expected: 'denied', got: 'allowed' };
  } catch (error) {
    return { label, ok: error.code === 'permission-denied', expected: 'denied', got: error.code || error.message };
  }
}

async function expectAllowed(label, action) {
  try {
    const result = await action();
    return { label, ok: true, expected: 'allowed', got: result ?? 'allowed' };
  } catch (error) {
    return { label, ok: false, expected: 'allowed', got: error.code || error.message };
  }
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const users = await loadUsers();
const admin = userByPerfil(users, 'ADMIN');
const operador = userByPerfil(users, 'OPERADOR');
const consulta = userByPerfil(users, 'CONSULTA');
const checks = [];

await signOut(auth).catch(() => {});
checks.push(await expectDenied('anonimo nao le veiculos', () => getDocs(collection(db, 'veiculos'))));

await signInWithEmailAndPassword(auth, admin.Email, String(admin.Sen_Segura));
checks.push(await expectAllowed('admin le segurancas', async () => (await getDocs(collection(db, 'segurancas'))).size));
await signOut(auth);

await signInWithEmailAndPassword(auth, consulta.Email, String(consulta.Sen_Segura));
checks.push(await expectAllowed('consulta le veiculos', async () => (await getDocs(collection(db, 'veiculos'))).size));
checks.push(await expectDenied('consulta nao cria motorista', () => addDoc(collection(db, 'motoristas'), {
  Nome: 'TESTE NEGADO',
  criadoEm: serverTimestamp()
})));
await signOut(auth);

await signInWithEmailAndPassword(auth, operador.Email, String(operador.Sen_Segura));
checks.push(await expectAllowed('operador cria auditoria', () => addDoc(collection(db, 'auditoria'), {
  tipo: 'TESTE_REGRAS',
  origem: 'scripts/verify-security-rules.mjs',
  criadoEm: serverTimestamp()
})));
await signOut(auth);

const failed = checks.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, checks }, null, 2));
if (failed.length) process.exit(1);
