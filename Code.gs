const lock = LockService.getScriptLock();
const cache = CacheService.getScriptCache();

const FIREBASE_CONFIG = {
    private_key: "-----BEGIN PRIVATE KEY-----\n-----END PRIVATE KEY-----\n",
    client_email: "",
    project_id: ""
};

function getFirebaseApp() {
    return FirebaseApp.getFirestore(FIREBASE_CONFIG.client_email, FIREBASE_CONFIG.private_key, FIREBASE_CONFIG.project_id);
}

function doGet(e) {
    const params = e.parameter;
    const route = params.route;
    let output;

    try {
        switch (route) {
            case 'validarSessao':
                output = validarSessao(params.token);
                break;
            case 'loginSeguranca':
                output = loginSeguranca(params.codigo);
                break;
            case 'logoutSeguranca':
                output = logoutSeguranca(params.token);
                break;
            case 'bootstrapSaida':
                output = bootstrapSaida(params.token);
                break;
            case 'bootstrapEntrada':
                output = bootstrapEntrada(params.token);
                break;
            case 'saida':
                output = registrarSaida(params);
                break;
            case 'entrada':
                output = registrarEntrada(params);
                break;
            case 'getVisitantesData':
                output = getVisitantesData(params.token);
                break;
            case 'salvarVisitante':
                output = salvarVisitante(JSON.parse(params.data));
                break;
            case 'getRelatorioGeral':
                output = getRelatorioGeral(params.token);
                break;
            default:
                output = { ok: false, message: 'Rota inválida' };
        }
    } catch (error) {
        output = { ok: false, message: 'Erro: ' + error.message, stack: error.stack };
    }

    return ContentService.createTextOutput(`${params.callback}(${JSON.stringify(output)})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function validarSessao(token) {
    if (!token) return { ok: false, message: 'Token não fornecido' };
    const sessionData = getSessionData(token);
    if (sessionData) {
        return { ok: true, autenticado: true, seguranca: sessionData.seguranca, expiraEm: sessionData.expiraEm };
    }
    return { ok: false, autenticado: false };
}

function loginSeguranca(codigo) {
    const firestore = getFirebaseApp();
    const seguranca = firestore.getDocument(`usuarios/${codigo}`).obj;

    if (seguranca) {
        const token = Utilities.getUuid();
        const expiraEm = Date.now() + (24 * 60 * 60 * 1000);
        const sessionData = { seguranca: seguranca.nome, expiraEm };

        cache.put(token, JSON.stringify(sessionData), 21600);

        return { ok: true, token, seguranca: seguranca.nome, expiraEm, message: 'Login bem-sucedido!' };
    }
    return { ok: false, message: 'Código de segurança inválido' };
}

function logoutSeguranca(token) {
    if (token) {
        cache.remove(token);
    }
    return { ok: true, message: 'Logout efetuado' };
}

function getSessionData(token) {
    if (!token) return null;
    const sessionJson = cache.get(token);
    if (!sessionJson) return null;
    const session = JSON.parse(sessionJson);
    if (session.expiraEm <= Date.now()) {
        cache.remove(token);
        return null;
    }
    return session;
}

function isAuthorized(token) {
    return !!getSessionData(token);
}

function bootstrapSaida(token) {
    if (!isAuthorized(token)) return { ok: false, message: 'Não autorizado' };

    const firestore = getFirebaseApp();
    const veiculos = firestore.getDocuments('veiculos').map(doc => doc.obj.nome);
    const motoristas = firestore.getDocuments('motoristas').map(doc => doc.obj.nome);
    const ultimasMovimentacoes = firestore.getDocuments('frota_movimentacao');

    const kmMap = ultimasMovimentacoes.reduce((acc, doc) => {
        const { veiculo, kmRetorno, kmSaida } = doc.obj;
        if (veiculo) {
            const kmFinal = parseFloat(kmRetorno) || parseFloat(kmSaida) || 0;
            if (!acc[veiculo] || kmFinal > acc[veiculo]) {
                acc[veiculo] = kmFinal;
            }
        }
        return acc;
    }, {});

    return { ok: true, veiculos, motoristas, kmMap };
}

function bootstrapEntrada(token) {
    if (!isAuthorized(token)) return { ok: false, message: 'Não autorizado' };

    const firestore = getFirebaseApp();
    const veiculosNaRua = firestore.query('frota_movimentacao').where('status', '==', 'EM TRANSITO').get().map(doc => {
        const data = doc.obj;
        return { documentId: doc.getName(), veiculo: data.veiculo, motorista: data.motorista, kmSaida: data.kmSaida };
    });

    return { ok: true, veiculosNaRua };
}

function registrarSaida(params) {
    if (!isAuthorized(params.token)) return { ok: false, message: 'Não autorizado' };

    const firestore = getFirebaseApp();
    const session = getSessionData(params.token);

    const newEntry = {
        veiculo: params.veiculo,
        motorista: params.motorista,
        kmSaida: params.KmSaida,
        destino: params.destino,
        dataSaida: new Date().toISOString(),
        status: 'EM TRANSITO',
        segurancaSaida: session.seguranca
    };

    firestore.createDocument('frota_movimentacao', newEntry);
    return { ok: true };
}

function registrarEntrada(params) {
    if (!isAuthorized(params.token)) return { ok: false, message: 'Não autorizado' };

    const firestore = getFirebaseApp();
    const session = getSessionData(params.token);

    const updateData = {
        kmRetorno: params.KmRetorno,
        dataRetorno: new Date().toISOString(),
        status: 'CONCLUIDO',
        segurancaEntrada: session.seguranca
    };

    firestore.updateDocument(`frota_movimentacao/${params.documentId}`, updateData, true);
    return { ok: true };
}

function getVisitantesData(token) {
    if (!isAuthorized(token)) return { ok: false, message: 'Não autorizado' };

    const firestore = getFirebaseApp();
    const visitantes = firestore.getDocuments('visitantes').map(doc => ({ documentId: doc.getName(), ...doc.obj }));
    const responsaveis = firestore.getDocuments('responsaveis').map(doc => doc.obj.nome);

    return { ok: true, visitantes, responsaveis };
}

function salvarVisitante(data) {
    if (!isAuthorized(data.token)) return { ok: false, message: 'Não autorizado' };

    const firestore = getFirebaseApp();
    const session = getSessionData(data.token);

    if (data.tipo === 'ENTRADA') {
        const newEntry = {
            nome: data.nome,
            cpf: data.cpf,
            telefone: data.telefone,
            responsavel: data.responsavel,
            dataEntrada: new Date().toISOString(),
            status: 'EM VISITA',
            segurancaEntrada: session.seguranca
        };
        firestore.createDocument('visitantes_movimentacao', newEntry);
    } else if (data.tipo === 'SAIDA') {
        const updateData = {
            dataSaida: new Date().toISOString(),
            status: 'FINALIZADO',
            segurancaSaida: session.seguranca
        };
        firestore.updateDocument(`visitantes_movimentacao/${data.documentId}`, updateData, true);
    }

    return { ok: true };
}

function getRelatorioGeral(token) {
    if (!isAuthorized(token)) return { ok: false, message: 'Não autorizado' };
    const firestore = getFirebaseApp();
    const movimentacoes = firestore.getDocuments('frota_movimentacao').map(doc => ({
        ...doc.obj,
        dataSaida: doc.obj.dataSaida ? new Date(doc.obj.dataSaida).toLocaleString('pt-BR') : '',
        dataRetorno: doc.obj.dataRetorno ? new Date(doc.obj.dataRetorno).toLocaleString('pt-BR') : ''
    }));
    return { ok: true, data: movimentacoes };
}
