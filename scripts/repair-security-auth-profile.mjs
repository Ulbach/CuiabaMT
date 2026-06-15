import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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
const password = String(process.env.SECURITY_PASSWORD || '').trim();
const name = String(process.env.SECURITY_NAME || '').trim().toUpperCase();
const profile = String(process.env.SECURITY_PROFILE || 'OPERADOR').trim().toUpperCase();
const dryRun = process.env.DRY_RUN !== '0';
const allowedProfiles = new Set(['ADMIN', 'OPERADOR', 'CONSULTA']);

if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Informe SECURITY_EMAIL com um e-mail valido.');
if (password && !/^\d{6}$/.test(password)) throw new Error('SECURITY_PASSWORD deve ter 6 digitos numericos.');
if (!allowedProfiles.has(profile)) throw new Error('SECURITY_PROFILE deve ser ADMIN, OPERADOR ou CONSULTA.');

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

async function createAuthUser() {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );
  const payload = await response.json();
  if (!response.ok) {
    const code = payload?.error?.message || response.status;
    if (code === 'EMAIL_EXISTS') {
      throw new Error('EMAIL_EXISTS: o usuario existe no Firebase Auth, mas a API client nao permite descobrir o uid. Remova o Auth orfao no Console ou use Admin SDK para vincular o uid correto.');
    }
    throw new Error(`Erro ao criar usuario Auth: ${code}`);
  }
  return { uid: payload.localId, idToken: payload.idToken };
}

async function deleteAuthUser(idToken) {
  if (!idToken) return false;
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${firebaseConfig.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    }
  );
  return response.ok;
}

function securityPayload(source, uid, securityId) {
  const nome = String(source?.Nome || name || email.split('@')[0]).trim().toUpperCase();
  return {
    uid,
    segurancaId: securityId,
    Email: email,
    Nome: nome,
    NomeBusca: nome,
    Perfil: String(source?.Perfil || profile).trim().toUpperCase(),
    Ativo: source?.Ativo !== false,
    Protegido: source?.Protegido === true,
    SuperAdmin: source?.SuperAdmin === true,
    CredencialPrivada: source?.CredencialPrivada === true,
    MustChangePassword: true,
    ReparadoPorScript: true,
    AtualizadoEm: serverTimestamp()
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
const profiles = profileSnap.docs.map((snap) => ({ id: snap.id, ...snap.data() }));

const actions = [];

if (securities.length > 1) throw new Error('Ha mais de um cadastro em segurancas para este e-mail. Corrija duplicidade manualmente antes do reparo.');
if (profiles.length > 1) throw new Error('Ha mais de um perfil em usuarios_auth para este e-mail. Corrija duplicidade manualmente antes do reparo.');

const security = securities[0] || null;
const profileDoc = profiles[0] || null;

if (security?.AuthUid) {
  const uid = security.AuthUid;
  actions.push(`Garantir usuarios_auth/${uid} vinculado a segurancas/${security.id}.`);
  actions.push(`Atualizar segurancas/${security.id} com MustChangePassword=true.`);
  if (!dryRun) {
    await setDoc(doc(db, 'usuarios_auth', uid), securityPayload(security, uid, security.id), { merge: true });
    await updateDoc(doc(db, 'segurancas', security.id), {
      AuthMigrado: true,
      AuthUid: uid,
      MustChangePassword: true,
      AtualizadoEm: serverTimestamp()
    });
  }
} else if (security && profileDoc?.id) {
  actions.push(`Vincular segurancas/${security.id} ao AuthUid ${profileDoc.id}.`);
  actions.push(`Atualizar usuarios_auth/${profileDoc.id} com segurancaId correto.`);
  if (!dryRun) {
    await updateDoc(doc(db, 'segurancas', security.id), {
      AuthMigrado: true,
      AuthUid: profileDoc.id,
      MustChangePassword: true,
      AtualizadoEm: serverTimestamp()
    });
    await setDoc(doc(db, 'usuarios_auth', profileDoc.id), securityPayload(security, profileDoc.id, security.id), { merge: true });
  }
} else if (security && !profileDoc) {
  if (!password) throw new Error('Cadastro sem AuthUid/perfil. Informe SECURITY_PASSWORD=123456 para criar Auth e reparar.');
  actions.push(`Criar usuario Auth para segurancas/${security.id} e vincular perfil.`);
  if (!dryRun) {
    const created = await createAuthUser();
    try {
      await setDoc(doc(db, 'usuarios_auth', created.uid), securityPayload(security, created.uid, security.id));
      await updateDoc(doc(db, 'segurancas', security.id), {
        AuthMigrado: true,
        AuthUid: created.uid,
        MustChangePassword: true,
        AtualizadoEm: serverTimestamp()
      });
    } catch (error) {
      await deleteAuthUser(created.idToken);
      throw error;
    }
  }
} else {
  if (!password || !name) throw new Error('Nao ha cadastro. Informe SECURITY_NAME e SECURITY_PASSWORD para criar seguranca completa.');
  actions.push('Criar usuario Auth, seguranca e usuarios_auth.');
  if (!dryRun) {
    const created = await createAuthUser();
    try {
      const securityRef = await addDoc(collection(db, 'segurancas'), {
        Ativo: true,
        AuthMigrado: true,
        AuthUid: created.uid,
        Email: email,
        Nome: name,
        NomeBusca: name,
        Perfil: profile,
        Protegido: false,
        SuperAdmin: false,
        CredencialPrivada: false,
        BloquearAlteracaoPorOutroAdmin: false,
        MustChangePassword: true,
        CriadoPorScript: true,
        CriadoEm: serverTimestamp(),
        AtualizadoEm: serverTimestamp()
      });
      await setDoc(doc(db, 'usuarios_auth', created.uid), securityPayload({ Nome: name, Perfil: profile, Ativo: true }, created.uid, securityRef.id));
    } catch (error) {
      await deleteAuthUser(created.idToken);
      throw error;
    }
  }
}

if (!dryRun) {
  await addDoc(collection(db, 'auditoria'), {
    tipo: 'REPARO_AUTH_SEGURANCA',
    alvoColecao: 'usuarios_auth',
    alvoId: security?.AuthUid || profileDoc?.id || email,
    usuarioUid: superAdmin.AuthUid || '',
    usuarioEmail: superAdmin.Email || '',
    usuarioNome: superAdmin.Nome || '',
    origem: 'scripts/repair-security-auth-profile.mjs',
    detalhes: { email, actions },
    criadoEm: serverTimestamp()
  });
}

await signOut(auth).catch(() => {});

console.log(JSON.stringify({
  dryRun,
  email,
  projectId: firebaseConfig.projectId,
  actions,
  repaired: !dryRun
}, null, 2));
