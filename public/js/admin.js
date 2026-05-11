// ================================= FIREBASE CONFIG =================================
const firebaseConfig = {
apiKey: "AIzaSyBeG7uirpSS3N0I48fy7WqJa_SSrb8A-48",
authDomain: "cuiaba-01617931-f126e.firebaseapp.com",
projectId: "cuiaba-01617931-f126e",
storageBucket: "cuiaba-01617931-f126e.firebasestorage.app",
messagingSenderId: "797115279316",
appId: "1:797115279316:web:f229366de16d4e066e1841"
};

if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// ================================= DOM ELEMENTS =================================
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const mainMenuContainer = document.getElementById('main-menu-view');
const userGreeting = document.getElementById('user-greeting');
const loginMsg = document.getElementById('login-msg');

const btnEntrar = document.getElementById('btnEntrar');
const btnLogout = document.getElementById('logout-btn');
const senhaInput = document.getElementById('senha');

// ================================= SESSION =================================
const STORAGE_KEY = 'delta_auth_firebase_v1';
const STORAGE_KEY_LEGADO = 'delta_auth_v1';
const SESSION_MS = 8 * 60 * 60 * 1000;

let currentUser = null;

function normalizarPerfil(perfil) {
return String(perfil || '').trim().toUpperCase();
}

function getAuth() {
try {
return JSON.parse(
localStorage.getItem(STORAGE_KEY) ||
localStorage.getItem(STORAGE_KEY_LEGADO) ||
'null'
);
} catch (_) {
return null;
}
}

function setAuth(sessao) {

localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));

// Compatibilidade telas antigas
localStorage.setItem(STORAGE_KEY_LEGADO, JSON.stringify({
token: sessao.id || sessao.Sen_Segura || 'firebase-local',
seguranca: sessao.Nome || '',
nome: sessao.Nome || '',
usuario: sessao.Nome || '',
perfil: sessao.Perfil || '',
expiraEm: sessao.expiraEm
}));
}

function clearAuth() {
localStorage.removeItem(STORAGE_KEY);
localStorage.removeItem(STORAGE_KEY_LEGADO);
}

function sessaoValidaLocal(auth) {

return !!(
auth &&
(auth.Nome || auth.seguranca || auth.nome || auth.usuario) &&
(auth.Perfil || auth.perfil) &&
auth.expiraEm &&
Number(auth.expiraEm) > Date.now()
);
}

function authParaUsuario(auth) {

return {
id: auth.id || auth.token || '',
Nome: auth.Nome || auth.seguranca || auth.nome || auth.usuario || '',
Email: auth.Email || '',
Perfil: normalizarPerfil(auth.Perfil || auth.perfil),
Sen_Segura: auth.Sen_Segura || ''
};
}

// ================================= VIEW =================================

function showLoginMessage(message) {
loginMsg.textContent = message || '';
}

function setLoading(loading) {

btnEntrar.disabled = !!loading;
senhaInput.disabled = !!loading;
}

function showLoginView() {

currentUser = null;

appView.classList.add('hidden');
loginView.classList.remove('hidden');

senhaInput.value = '';
senhaInput.disabled = false;
btnEntrar.disabled = false;

showLoginMessage('Digite seu código para entrar.');

setTimeout(() => {
senhaInput.focus();
}, 50);
}

function showAppView() {

loginView.classList.add('hidden');
appView.classList.remove('hidden');

const perfil = normalizarPerfil(currentUser.Perfil);

userGreeting.innerHTML =
`Olá, <strong>${escapeHtml(currentUser.Nome || 'Segurança')}</strong> • ${escapeHtml(perfil)}`;

renderMainMenu();
}

function escapeHtml(v) {

return String(v == null ? '' : v)
.replace(/&/g, '&')
.replace(/</g, '<')
.replace(/>/g, '>')
.replace(/"/g, '"')
.replace(/'/g, ''');
}

// ================================= FIRESTORE LOGIN =================================

async function buscarSegurancaPorCodigo(codigo) {

const snap = await db.collection('segurancas')
.where('Sen_Segura', '==', codigo)
.where('Ativo', '==', true)
.limit(1)
.get();

if (snap.empty) {
return null;
}

const docItem = snap.docs[0];

return {
id: docItem.id,
...docItem.data()
};
}

async function handleLogin() {

const codigo = (senhaInput.value || '').trim();

if (!codigo) {

```
showLoginMessage('Digite seu código de acesso.');
senhaInput.focus();
return;
```

}

setLoading(true);

showLoginMessage('Verificando código no Firebase...');

try {

```
const usuario = await buscarSegurancaPorCodigo(codigo);

if (!usuario) {

  showLoginMessage('Código de acesso não encontrado.');
  setLoading(false);
  return;
}

const perfil = normalizarPerfil(usuario.Perfil);

if (perfil !== 'ADMIN') {

  showLoginMessage('Acesso negado. Área exclusiva ADMIN.');
  setLoading(false);
  return;
}

currentUser = {
  id: usuario.id,
  Nome: usuario.Nome || '',
  Email: usuario.Email || '',
  Perfil: perfil,
  Sen_Segura: usuario.Sen_Segura || '',
  expiraEm: Date.now() + SESSION_MS
};

setAuth(currentUser);

showLoginMessage('Acesso liberado.');

showAppView();
```

} catch (e) {

```
console.error(e);

showLoginMessage('Erro ao conectar no Firebase.');
```

} finally {

```
setLoading(false);
```

}
}

function handleLogout() {

clearAuth();

showLoginView();
}

// ================================= MENU =================================

function renderMainMenu() {

mainMenuContainer.innerHTML = `

```
<a href="veiculos.html" class="menu-btn">
  <div style="display:flex;align-items:center;gap:14px;">
    <div class="menu-icon">🚗</div>
    <div>
      Controle de Veículos
      <small>Entrada, saída e relatórios da frota</small>
    </div>
  </div>
  <div class="menu-arrow">›</div>
</a>

<a href="visitantes.html" class="menu-btn">
  <div style="display:flex;align-items:center;gap:14px;">
    <div class="menu-icon">🛂</div>
    <div>
      Controle de Visitantes
      <small>Entrada, saída e registros de visitantes</small>
    </div>
  </div>
  <div class="menu-arrow">›</div>
</a>

<a href="cadastros.html" class="menu-btn">
  <div style="display:flex;align-items:center;gap:14px;">
    <div class="menu-icon">⚙️</div>
    <div>
      Cadastros e Configurações
      <small>Veículos, motoristas e segurança</small>
    </div>
  </div>
  <div class="menu-arrow">›</div>
</a>
```

`;
}

// ================================= INIT =================================

function tentarAbrirSessaoExistente() {

const auth = getAuth();

if (!sessaoValidaLocal(auth)) {

```
clearAuth();

showLoginView();

return;
```

}

const usuario = authParaUsuario(auth);

if (normalizarPerfil(usuario.Perfil) !== 'ADMIN') {

```
clearAuth();

showLoginView();

showLoginMessage('Acesso negado. Área exclusiva ADMIN.');

return;
```

}

currentUser = usuario;

showAppView();
}

// ================================= EVENTS =================================

btnEntrar.addEventListener('click', handleLogin);

senhaInput.addEventListener('keydown', function(event) {

if (event.key === 'Enter') {
handleLogin();
}
});

btnLogout.addEventListener('click', handleLogout);

window.addEventListener('load', tentarAbrirSessaoExistente);
