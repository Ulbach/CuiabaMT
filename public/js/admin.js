const STORAGE_KEY = 'delta_auth_firebase_v1';
const STORAGE_KEY_LEGADO = 'delta_auth_v1';

const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const mainMenuContainer = document.getElementById('main-menu-view');
const userGreeting = document.getElementById('user-greeting');
const btnLogout = document.getElementById('logout-btn');

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

function perfil(auth) {
  return String(auth?.Perfil || auth?.perfil || '').trim().toUpperCase();
}

function nome(auth) {
  return auth?.Nome || auth?.seguranca || auth?.nome || auth?.usuario || '';
}

function sessaoValida(auth) {
  if (!auth) return false;
  if (!nome(auth)) return false;
  if (!perfil(auth)) return false;
  if (auth.expiraEm && Number(auth.expiraEm) <= Date.now()) return false;
  return true;
}

function esc(v) {
  return String(v || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function abrirAdmin(auth) {
  loginView.classList.add('hidden');
  appView.classList.remove('hidden');

  userGreeting.innerHTML = `Olá, <strong>${esc(nome(auth))}</strong> • ${esc(perfil(auth))}`;

  mainMenuContainer.innerHTML = `
    <a href="cad_motoristas.html" class="menu-btn">
      <div style="display:flex;align-items:center;gap:14px;">
        <div class="menu-icon">👨‍✈️</div>
        <div>
          Cadastro de Motoristas
          <small>Gerenciar motoristas autorizados</small>
        </div>
      </div>
      <div class="menu-arrow">›</div>
    </a>

    <a href="cad_segurancas.html" class="menu-btn">
      <div style="display:flex;align-items:center;gap:14px;">
        <div class="menu-icon">🛡️</div>
        <div>
          Cadastro de Seguranças
          <small>Usuários e permissões do sistema</small>
        </div>
      </div>
      <div class="menu-arrow">›</div>
    </a>

    <a href="cad_veiculos.html" class="menu-btn">
      <div style="display:flex;align-items:center;gap:14px;">
        <div class="menu-icon">🚗</div>
        <div>
          Cadastro de Veículos
          <small>Gerenciar frota e veículos ativos</small>
        </div>
      </div>
      <div class="menu-arrow">›</div>
    </a>
  `;
}

function bloquear() {
  location.href = 'index.html';
}

window.addEventListener('load', () => {
  const auth = getAuth();

  if (!sessaoValida(auth)) {
    bloquear();
    return;
  }

  if (perfil(auth) !== 'ADMIN') {
    bloquear();
    return;
  }

  abrirAdmin(auth);
});

if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    clearAuth();
    location.href = 'index.html';
  });
}