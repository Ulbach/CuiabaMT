// ================================= ADMIN.JS - SESSÃO ÚNICA =================================
// ADMIN usa a sessão criada no index.html.
// Não existe segundo login aqui.

const STORAGE_KEY = 'delta_auth_firebase_v1';
const STORAGE_KEY_LEGADO = 'delta_auth_v1';

// ================================= DOM =================================
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const mainMenuContainer = document.getElementById('main-menu-view');
const userGreeting = document.getElementById('user-greeting');
const loginMsg = document.getElementById('login-msg');
const btnLogout = document.getElementById('logout-btn');

const btnEntrar = document.getElementById('btnEntrar');
const senhaInput = document.getElementById('senha');

let currentUser = null;

// ================================= HELPERS =================================
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

function clearAuth() {
localStorage.removeItem(STORAGE_KEY);
localStorage.removeItem(STORAGE_KEY_LEGADO);
}

function sessaoValidaLocal(auth) {

if (!auth) return false;

const nome =
auth.Nome ||
auth.seguranca ||
auth.nome ||
auth.usuario;

const perfil =
auth.Perfil ||
auth.perfil;

if (!nome || !perfil) return false;

if (auth.expiraEm && Number(auth.expiraEm) <= Date.now()) {
return false;
}

return true;
}

function authParaUsuario(auth) {

return {
id: auth.id || auth.token || '',
Nome:
auth.Nome ||
auth.seguranca ||
auth.nome ||
auth.usuario ||
'',
Perfil: normalizarPerfil(
auth.Perfil || auth.perfil
)
};
}

function escapeHtml(v) {

return String(v == null ? '' : v)
.replace(/&/g, '&')
.replace(/</g, '<')
.replace(/>/g, '>')
.replace(/"/g, '"')
.replace(/'/g, ''');
}

// ================================= BLOQUEIO =================================
function mostrarMensagemBloqueio(msg) {

if (appView) appView.classList.add('hidden');

if (loginView) loginView.classList.remove('hidden');

const title = loginView.querySelector('.title');
const sub = loginView.querySelector('.sub');
const field = loginView.querySelector('.field');

if (title) title.textContent = 'Acesso restrito';

if (sub) {
sub.textContent =
'Esta área é exclusiva para ADMIN.';
}

if (field) field.style.display = 'none';

if (btnEntrar) btnEntrar.style.display = 'none';

if (loginMsg) {
loginMsg.textContent =
msg || 'Acesso negado.';
loginMsg.style.color = '#ff4d4f';
}

setTimeout(() => {
location.href = 'index.html';
}, 1800);
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
      <small>Entrada, saída e relatórios</small>
    </div>
  </div>
  <div class="menu-arrow">›</div>
</a>

<a href="visitantes.html" class="menu-btn">
  <div style="display:flex;align-items:center;gap:14px;">
    <div class="menu-icon">🛂</div>
    <div>
      Controle de Visitantes
      <small>Entrada e saída visitantes</small>
    </div>
  </div>
  <div class="menu-arrow">›</div>
</a>

<a href="cadastros.html" class="menu-btn">
  <div style="display:flex;align-items:center;gap:14px;">
    <div class="menu-icon">⚙️</div>
    <div>
      Cadastros
      <small>Veículos, motoristas e segurança</small>
    </div>
  </div>
  <div class="menu-arrow">›</div>
</a>

<a href="rel_geral.html" class="menu-btn">
  <div style="display:flex;align-items:center;gap:14px;">
    <div class="menu-icon">📊</div>
    <div>
      Relatórios
      <small>Consultas gerais</small>
    </div>
  </div>
  <div class="menu-arrow">›</div>
</a>
```

`;
}

function showAdminView() {

if (loginView) {
loginView.classList.add('hidden');
}

if (appView) {
appView.classList.remove('hidden');
}

const perfil = normalizarPerfil(currentUser.Perfil);

userGreeting.innerHTML =
`Olá, <strong>${escapeHtml(currentUser.Nome)}</strong> • ${escapeHtml(perfil)}`;

renderMainMenu();
}

// ================================= LOGOUT =================================
function trocarUsuario() {

clearAuth();

location.href = 'index.html';
}

// ================================= INIT =================================
function initAdmin() {

const auth = getAuth();

if (!sessaoValidaLocal(auth)) {

```
mostrarMensagemBloqueio(
  'Sessão inválida. Faça login novamente.'
);

return;
```

}

const usuario = authParaUsuario(auth);

const perfil = normalizarPerfil(usuario.Perfil);

if (perfil !== 'ADMIN') {

```
mostrarMensagemBloqueio(
  'Usuário sem permissão ADMIN.'
);

return;
```

}

currentUser = usuario;

showAdminView();
}

// ================================= EVENTS =================================
if (btnLogout) {
btnLogout.addEventListener('click', trocarUsuario);
}

window.addEventListener('load', initAdmin);
