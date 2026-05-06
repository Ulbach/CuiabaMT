// ================================= FIREBASE CONFIG (Auth is bypassed) =================================
const firebaseConfig = {
    apiKey: "AIzaSyBeG7uirpSS3N0I48fy7WqJa_SSrb8A-48",
    authDomain: "cuiaba-01617931-f126e.firebaseapp.com",
    projectId: "cuiaba-01617931-f126e",
    storageBucket: "cuiaba-01617931-f126e.appspot.com",
    messagingSenderId: "797115279316",
    appId: "1:797115279316:web:f229366de16d4e066e1841"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Database connection is still needed.

// ================================= DOM ELEMENTS =================================
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const mainMenuContainer = document.getElementById('main-menu-view');
const userGreeting = document.getElementById('user-greeting');
const loginMsg = document.getElementById('login-msg');

const btnEntrar = document.getElementById('btnEntrar');
const btnLogout = document.getElementById('logout-btn');
const senhaInput = document.getElementById('senha');

// ================================= APP STATE =================================
let currentUser = null;
const segurancasHardcoded = [
    { nome: "PATRICK HALISSON DE BARROS TORALES", codigo: "1122", perfil: "admin" },
    { nome: "RONALDO ESTRAL SANTANA", codigo: "3344", perfil: "operador" },
    { nome: "OPERADOR ULBACH", codigo: "5566", perfil: "operador" }
];

// ================================= AUTH FUNCTIONS (BYPASS) =================================

async function handleLogin() {
    const codigo = senhaInput.value;
    if (!codigo) {
        showLoginMessage('Digite seu código de acesso.');
        return;
    }

    showLoginMessage('Verificando código...');

    const userFound = segurancasHardcoded.find(seg => seg.codigo === codigo);

    if (userFound) {
        currentUser = userFound;
        showAppView();
    } else {
        showLoginMessage('Código de acesso não encontrado.');
    }
}

function handleLogout() {
    currentUser = null;
    showLoginView();
}

// ================================= VIEW MANAGEMENT =================================

function showLoginMessage(message, type = 'info') {
    loginMsg.textContent = message;
    // Simple message display, no need for different classes in the new design.
}

function showLoginView() {
    appView.classList.add('hidden');
    loginView.classList.remove('hidden');
    senhaInput.value = '';
    showLoginMessage('Digite seu código para entrar.');
    senhaInput.focus();
}

function showAppView() {
    loginView.classList.add('hidden');
    appView.classList.remove('hidden');
    // Using the full name as per the new design reference
    userGreeting.innerHTML = `Olá, <strong>${currentUser.nome}</strong>!`;
    renderMainMenu();
}

// ================================= DYNAMIC CONTENT RENDERING =================================

function renderMainMenu() {
    mainMenuContainer.innerHTML = ''; // Clear previous menu

    // The new menu is the same for all user profiles
    mainMenuContainer.innerHTML = `
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
              <small>Acessar o outro app usando a mesma autenticação</small>
            </div>
          </div>
          <div class="menu-arrow">›</div>
        </a>
    `;
}

// ================================= EVENT LISTENERS =================================

btnEntrar.addEventListener('click', handleLogin);
senhaInput.addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
        handleLogin();
    }
});
btnLogout.addEventListener('click', handleLogout);


// Initial setup
showLoginView();
