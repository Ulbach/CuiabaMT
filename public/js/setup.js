
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================================= CONFIG =================================
const firebaseConfig = {
    apiKey: "AIzaSyBeG7uirpSS3N0I48fy7WqJa_SSrb8A-48",
    authDomain: "cuiaba-01617931-f126e.firebaseapp.com",
    projectId: "cuiaba-01617931-f126e",
    storageBucket: "cuiaba-01617931-f126e.appspot.com",
    messagingSenderId: "797115279316",
    appId: "1:797115279316:web:f229366de16d4e066e1841"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const segurancas = [
    { nome: "PATRICK HALISSON DE BARROS TORALES", codigo: "1122", perfil: "admin", status: "ativo" },
    { nome: "RONALDO ESTRAL SANTANA", codigo: "3344", perfil: "operador", status: "ativo" },
    { nome: "OPERADOR ULBACH", codigo: "5566", perfil: "operador", status: "ativo" }
];

const veiculos = [
    "Amarok - QCH7131",
    "Gol Prata - QCH7171",
    "Gol Prata - QCI3271",
    "Caminhão - FBZ8609"
];


// ================================= DOM & LOG =================================
const btnCadastrar = document.getElementById('btnCadastrar');
const logContainer = document.getElementById('log');

function log(message, type = 'info') {
    const p = document.createElement('p');
    p.textContent = message;
    p.className = type;
    logContainer.appendChild(p);
}

// ================================= CORE FUNCTION =================================

async function iniciarCadastro() {
    btnCadastrar.disabled = true;
    logContainer.innerHTML = '';
    log('Iniciando processo...');

    let successCount = 0;

    // --- 1. Criar Coleções no Banco de Dados ---
    try {
        log('--- Etapa 1: Populando Banco de Dados ---');

        // Coleção 'segurancas'
        log('Criando coleção "segurancas"...');
        for (const seg of segurancas) {
            await setDoc(doc(db, "segurancas", seg.codigo), seg);
            log(`- Documento para ${seg.nome} criado.`);
        }
        log('Coleção "segurancas" OK.', 'success');

        // Coleção 'frota_veiculos'
        log('Criando coleção "frota_veiculos"...');
        for (const veiculo of veiculos) {
            await setDoc(doc(collection(db, "frota_veiculos")), { nome: veiculo });
        }
        log('Coleção "frota_veiculos" OK.', 'success');
        
        // Coleção 'frota_motoristas'
        log('Criando coleção "frota_motoristas" (vazia)...');
        const placeholderDoc = doc(collection(db, "frota_motoristas"), 'placeholder');
        await setDoc(placeholderDoc, { note: 'Coleção vazia.' });
        //await deleteDoc(placeholderDoc); // A coleção existe mesmo se o doc for deletado
        log('Coleção "frota_motoristas" OK.', 'success');
        
        log('Banco de dados populado com sucesso!', 'success');
        successCount++;

    } catch (error) {
        log(`ERRO CRÍTICO ao popular o banco: ${error.message}`, 'error');
        btnCadastrar.disabled = false;
        return;
    }


    // --- 2. Criar Usuários de Autenticação ---
    try {
        log('--- Etapa 2: Cadastrando usuários no Firebase Auth ---');
        const gerarEmail = (nome) => `${nome.split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@delta.com`;

        for (const seg of segurancas) {
            const email = gerarEmail(seg.nome);
            const password = seg.codigo;
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                log(`- Usuário Auth para ${seg.nome} (email: ${email}) criado.`);
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    log(`- Usuário Auth para ${seg.nome} (email: ${email}) já existe.`, 'info');
                } else {
                    throw error; // Lança outros erros
                }
            }
        }
        log('Usuários de autenticação verificados/criados!', 'success');
        successCount++;

    } catch (error) {
        log(`ERRO ao criar usuários de autenticação: ${error.message}`, 'error');
    }

    // --- Final ---
    if (successCount === 2) {
        log('PROCESSO CONCLUÍDO COM SUCESSO. O sistema está pronto.', 'success');
    } else {
        log('Processo finalizado com erros. Verifique o log acima.', 'error');
    }
    
    btnCadastrar.disabled = false;
}

btnCadastrar.addEventListener('click', iniciarCadastro);
