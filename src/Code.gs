/**
 * DELTA PRO CUIABA - SISTEMA UNIFICADO (FROTA & VISITANTES)
 * VERSAO FULL FIREBASE
 */

const FIREBASE_PROJECT_ID = "cuiaba-01617931-f126e"; // <-- CORRIGIDO
const FIRESTORE_API_BASE_URL = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID + "/databases/(default)/documents/";

// A planhilha não é mais usada para frota ou visitantes, mas mantemos o ID para referência ou futuro fallback.
const PLANILHA_ID = "1h1kgl9w6UL8JlxMvlywJM1AIthU_U1dGzQ84JicrlOU";

const SESSION_PREFIX = "sessao_seguranca_";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

/* ================= FIREBASE SERVICE ================= */

function getFirebaseToken_() {
  const cache = CacheService.getScriptCache();
  const token = cache.get("firebase_token");
  if (token) return token;
  const newToken = ScriptApp.getOAuthToken();
  cache.put("firebase_token", newToken, 1800);
  return newToken;
}

function readCollectionFromFirestore_(collectionName) {
  if (!FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID.startsWith("SEU-ID")) {
    console.error("ID do Projeto Firebase não configurado.");
    return null;
  }
  const url = FIRESTORE_API_BASE_URL + collectionName;
  const options = { method: "get", headers: { "Authorization": "Bearer " + getFirebaseToken_() }, muteHttpExceptions: true };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      const firestoreResponse = JSON.parse(responseBody);
      if (!firestoreResponse.documents) return [];
      return firestoreResponse.documents.map(function(doc) {
        const docNameParts = doc.name.split('/');
        const docId = docNameParts[docNameParts.length - 1];
        const fields = doc.fields;
        const result = { id: docId };
        for (const key in fields) {
          const valueObj = fields[key];
          if (valueObj.stringValue !== undefined) result[key] = valueObj.stringValue;
          else if (valueObj.integerValue !== undefined) result[key] = parseInt(valueObj.integerValue, 10);
          else if (valueObj.doubleValue !== undefined) result[key] = parseFloat(valueObj.doubleValue);
          else if (valueObj.booleanValue !== undefined) result[key] = valueObj.booleanValue;
          else if (valueObj.timestampValue !== undefined) result[key] = valueObj.timestampValue;
        }
        return result;
      });
    } else {
      console.error("Erro ao ler do Firestore (" + collectionName + "): " + responseBody);
      return null;
    }
  } catch (e) {
    console.error("Exceção ao ler do Firestore (" + collectionName + "): " + e.toString());
    return null;
  }
}

function createDocumentInFirestore_(collectionName, dataFields) {
  if (!FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID.startsWith("SEU-ID")) return null;
  const url = FIRESTORE_API_BASE_URL + collectionName;
  const options = { method: 'post', contentType: 'application/json', headers: { 'Authorization': 'Bearer ' + getFirebaseToken_() }, payload: JSON.stringify({ fields: dataFields }), muteHttpExceptions: true };
  try {
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() < 300) return JSON.parse(response.getContentText());
    console.error("Erro ao criar documento em (" + collectionName + "): " + response.getContentText());
    return null;
  } catch (e) {
    console.error("Exceção ao criar documento em (" + collectionName + "): " + e.toString());
    return null;
  }
}

function patchDocumentInFirestore_(collectionName, documentId, dataFields, updateMask) {
  if (!FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID.startsWith("SEU-ID")) return null;
  let url = FIRESTORE_API_BASE_URL + collectionName + "/" + documentId;
  if (updateMask && Array.isArray(updateMask)) {
    url += "?" + updateMask.map(field => "updateMask.fieldPaths=" + encodeURIComponent(field)).join("&");
  }
  const options = { method: 'patch', contentType: 'application/json', headers: { 'Authorization': 'Bearer ' + getFirebaseToken_() }, payload: JSON.stringify({ fields: dataFields }), muteHttpExceptions: true };
  try {
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) return JSON.parse(response.getContentText());
    console.error("Erro ao atualizar documento (" + documentId + "): " + response.getContentText());
    return null;
  } catch (e) {
    console.error("Exceção ao atualizar documento (" + documentId + "): " + e.toString());
    return null;
  }
}

/* ================= LISTAS FIXAS - SERVICE (com CACHE) ================= */

function getListaVeiculosRaw_() {
  const cache = CacheService.getScriptCache(); const cacheKey = "firebase_list_veiculos_v2";
  const cached = cache.get(cacheKey); if (cached) { try { return JSON.parse(cached); } catch(e){} }
  const fromFirebase = readCollectionFromFirestore_("frota_veiculos");
  if (fromFirebase !== null) {
    const result = fromFirebase.map(item => item.nome);
    cache.put(cacheKey, JSON.stringify(result), 300);
    return result;
  }
  return [];
}

function getListaMotoristasRaw_() {
  const cache = CacheService.getScriptCache(); const cacheKey = "firebase_list_motoristas_v2";
  const cached = cache.get(cacheKey); if (cached) { try { return JSON.parse(cached); } catch(e){} }
  const fromFirebase = readCollectionFromFirestore_("frota_motoristas");
  if (fromFirebase !== null) {
    cache.put(cacheKey, JSON.stringify(fromFirebase), 300);
    return fromFirebase;
  }
  return [];
}

function getListaSegurancasRaw_() {
  const cache = CacheService.getScriptCache(); const cacheKey = "firebase_list_segurancas_v2";
  const cached = cache.get(cacheKey); if (cached) { try { return JSON.parse(cached); } catch(e){} }
  const fromFirebase = readCollectionFromFirestore_("frota_segurancas");
  if (fromFirebase !== null) {
    cache.put(cacheKey, JSON.stringify(fromFirebase), 300);
    return fromFirebase;
  }
  return [];
}

function normalizarListaTexto_(lista) { return [...new Set((lista || []).map(item => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")); }
function parseDataListaFixa_(texto) { if (!texto) return null; const m = String(texto).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (!m) return null; return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])); }
function hojeNormalizado_() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function cnhListaFixaValida_(texto) { const d = parseDataListaFixa_(texto); return d ? d.getTime() >= hojeNormalizado_().getTime() : false; }
function getListaVeiculosFixos() { return normalizarListaTexto_(getListaVeiculosRaw_()); }
function getListaMotoristasFixos() { return normalizarListaTexto_(getListaMotoristasRaw_().filter(item => item && cnhListaFixaValida_(item.validadeCnh)).map(item => item && item.nome)); }
function getListaSegurancasFixos() { return normalizarListaTexto_(getListaSegurancasRaw_().map(item => item && item.nome)); }

function getMapaCodigosSegurancasFixos() {
  const mapa = {};
  getListaSegurancasRaw_().forEach(item => {
    if (!item || typeof item !== "object") return;
    const codigo = String(item.codigo || "").trim();
    const nome = String(item.nome || "").trim();
    if (codigo && nome) mapa[codigo] = nome;
  });
  return mapa;
}

function getListasFrota() { return { veiculos: getListaVeiculosFixos(), motoristas: getListaMotoristasFixos(), segurancas: getListaSegurancasFixos() }; }

/* ================= CORE ================= */

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  const route = p.route || "";
  const callback = p.callback || "callback";
  let result;
  try {
    if (route === "pingVersao") result = { ok: true, versao: "CUIABA_CODE_FULL_FIREBASE_01", scriptId: ScriptApp.getScriptId() };
    else if (route === "loginSeguranca") result = loginSeguranca(p.codigo);
    else if (route === "validarSessao") result = validarSessaoSeguranca(p.token);
    else if (route === "logoutSeguranca") result = logoutSeguranca(p.token);
    else if (route === "getVisitantesData") result = getVisitantesData();
    else if (route === "salvarVisitante") result = salvarVisitante(p.data);
    else if (route === "bootstrapSaida") result = getBootstrapSaida();
    else if (route === "bootstrapEntrada") result = getBootstrapEntrada();
    else if (route === "home" || route === "listsAvail") result = getDashboardAndLists();
    else if (route === "kmAtual") result = getKmAtual(p.veiculo);
    else if (route === "saida") result = registrarSaidaFrota(p);
    else if (route === "entrada") result = registrarEntradaFrota(p);
    else result = { ok: false, message: "Rota desconhecida: " + route };
  } catch (err) {
    result = { ok: false, message: err && err.toString ? err.toString() : String(err) };
  }
  return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/* ================= LOGIN / SESSAO ================= */

function gerarTokenSessao() { return Utilities.getUuid().replace(/-/g, "") + "_" + new Date().getTime(); }
function getSessaoKey(token) { return SESSION_PREFIX + String(token || "").trim(); }
function salvarSessaoSeguranca(token, payload) { PropertiesService.getScriptProperties().setProperty(getSessaoKey(token), JSON.stringify(payload)); }
function removerSessaoSeguranca(token) { if (token) PropertiesService.getScriptProperties().deleteProperty(getSessaoKey(token)); }
function lerSessaoSeguranca(token) {
  if (!token) return null;
  const raw = PropertiesService.getScriptProperties().getProperty(getSessaoKey(token));
  if (!raw) return null;
  try {
    const sessao = JSON.parse(raw);
    if (sessao && sessao.expiraEm && Number(sessao.expiraEm) >= Date.now()) return sessao;
  } catch (e) {}
  removerSessaoSeguranca(token);
  return null;
}
function buscarSegurancaPorCodigo(codigo) {
  const alvo = String(codigo || "").trim();
  if (!alvo) return null;
  const lista = getListaSegurancasRaw_();
  for (let i = 0; i < lista.length; i++) {
    const item = lista[i] || {};
    const cod = String(item.codigo || "").trim();
    const nome = String(item.nome || "").trim();
    if (cod === alvo && nome) return { seguranca: nome, codigo: alvo };
  }
  return null;
}
function loginSeguranca(codigo) {
  const cadastro = buscarSegurancaPorCodigo(codigo);
  if (!cadastro) return { ok: false, message: "Codigo invalido." };
  const token = gerarTokenSessao(), agora = Date.now();
  const payload = { token, seguranca: cadastro.seguranca, criadoEm: agora, expiraEm: agora + SESSION_TTL_MS };
  salvarSessaoSeguranca(token, payload);
  return { ok: true, token, seguranca: cadastro.seguranca, expiraEm: payload.expiraEm, message: "Ola, " + cadastro.seguranca + "!" };
}
function validarSessaoSeguranca(token) {
  const sessao = lerSessaoSeguranca(token);
  if (!sessao) return { ok: false, autenticado: false, message: "Sessao invalida ou expirada." };
  return { ok: true, autenticado: true, seguranca: sessao.seguranca, expiraEm: sessao.expiraEm };
}
function logoutSeguranca(token) { removerSessaoSeguranca(token); return { ok: true }; }
function exigirSessaoSeguranca(token) { const sessao = lerSessaoSeguranca(token); if (!sessao) throw new Error("Sessao invalida ou expirada."); return sessao; }

/* ================= VISITANTES (FIREBASE) ================= */

function getVisitantesData() {
  const firestoreData = readCollectionFromFirestore_("visitantes");
  if (firestoreData) {
    const visitantes = firestoreData.map(v => ({ documentId: v.id, cpf: v.cpf||"", nome: v.nome||"", telefone: v.telefone||"", status: v.status||"" }));
    const responsaveis = [...new Set(firestoreData.map(v => v.responsavel).filter(Boolean))];
    return { ok: true, visitantes, responsaveis, source: 'firestore' };
  }
  return { ok: false, message: "Falha ao buscar dados de visitantes." };
}
function salvarVisitante(jsonData) {
  const p = JSON.parse(decodeURIComponent(jsonData));
  const sessao = p.token ? lerSessaoSeguranca(p.token) : null;
  const seguranca = sessao ? String(sessao.seguranca || p.seguranca || "").trim() : String(p.seguranca || "").trim();
  if (p.tipo === "SAIDA") {
    if (!p.documentId) return { ok: false, message: "ID do visitante (documentId) não fornecido para a saída."};
    const updatedFields = { 'status': { stringValue: "CONCLUIDO" }, 'timestamp_saida': { timestampValue: new Date().toISOString() }, 'seguranca_saida': { stringValue: seguranca } };
    const updateMask = ['status', 'timestamp_saida', 'seguranca_saida'];
    if (!patchDocumentInFirestore_('visitantes', p.documentId, updatedFields, updateMask)) return { ok: false, message: "Falha ao registrar saída no Firestore." };
  } else {
    const newVisitorFields = { 'timestamp_entrada':{timestampValue:new Date().toISOString()}, 'cpf':{stringValue:p.cpf||""}, 'nome':{stringValue:p.nome||""}, 'telefone':{stringValue:p.telefone||""}, 'status':{stringValue:"EM VISITA"}, 'responsavel':{stringValue:p.responsavel||""}, 'seguranca_entrada':{stringValue:seguranca}};
    if (!createDocumentInFirestore_('visitantes', newVisitorFields)) return { ok: false, message: "Falha ao registrar entrada no Firestore." };
  }
  return { ok: true, seguranca: seguranca };
}

/* ================= FROTA (FIREBASE) ================= */

function parseKmStringAsNumber_(kmString) { if (kmString === null || kmString === undefined) return 0; return Number(String(kmString).replace(/[^0-9]/g, '')) || 0; }

function getFrotaDataFromFirestore_() {
    const cache = CacheService.getScriptCache();
    const cacheKey = "firestore_frota_data_v2";
    const cached = cache.get(cacheKey);
    if (cached) { try { return JSON.parse(cached); } catch(e) { console.error("Erro no parse do cache da frota: " + e.toString()); } }

    const firestoreData = readCollectionFromFirestore_("frota_movimentacao");
    if (!firestoreData) return { ok: false, message: "Could not fetch fleet data from Firestore." };
    
    firestoreData.sort((a, b) => { const dateA = a.timestamp_saida ? new Date(a.timestamp_saida) : 0; const dateB = b.timestamp_saida ? new Date(b.timestamp_saida) : 0; return dateB - dateA; });

    const veiculosNaRua = firestoreData.filter(item => item.status === "EM TRANSITO");
    const recentes = firestoreData.slice(0, 5);
    const ultimosKm = {};
    for (const item of firestoreData) {
        const veiculo = item.veiculo;
        if (!veiculo || ultimosKm[veiculo]) continue;
        if (item.status === "CONCLUIDO" && item.km_retorno) ultimosKm[veiculo] = item.km_retorno;
        else if (item.km_saida) ultimosKm[veiculo] = item.km_saida;
    }
    
    const result = { ok: true, veiculosNaRua, recentes, ultimosKm };
    cache.put(cacheKey, JSON.stringify(result), 45);
    return result;
}

function registrarSaidaFrota(p) {
    const sessao = exigirSessaoSeguranca(p.token);
    const frotaData = getFrotaDataFromFirestore_();
    if (frotaData.ok && frotaData.veiculosNaRua.some(v => v.veiculo === p.veiculo)) return { ok: false, message: "Veículo já está em trânsito." };

    const newTripFields = { 'timestamp_saida': { timestampValue: new Date().toISOString() }, 'veiculo': { stringValue: p.veiculo || "" }, 'motorista': { stringValue: p.motorista || "" }, 'seguranca_saida': { stringValue: sessao.seguranca }, 'km_saida': { stringValue: String(p.KmSaida || p.kmSaida || "0") }, 'destino': { stringValue: p.destino || "" }, 'status': { stringValue: "EM TRANSITO" } };
    if (!createDocumentInFirestore_('frota_movimentacao', newTripFields)) return { ok: false, message: "Falha ao registrar saída no Firestore." };
    
    CacheService.getScriptCache().remove("firestore_frota_data_v2");
    return { ok: true, seguranca: sessao.seguranca };
}

function registrarEntradaFrota(p) {
    const sessao = exigirSessaoSeguranca(p.token);
    if (!p.documentId) return { ok: false, message: "ID do registro de frota (documentId) não fornecido."};
    
    const kmRet = parseKmStringAsNumber_(p.KmRetorno || p.kmRetorno);
    const frotaData = getFrotaDataFromFirestore_();
    if (frotaData.ok) {
      const trip = frotaData.veiculosNaRua.find(v => v.id === p.documentId);
      if (trip) {
        const kmSai = parseKmStringAsNumber_(trip.km_saida);
        if (kmRet < kmSai) return { ok: false, message: "KM de retorno não pode ser inferior ao KM de saída (" + kmSai + " km)." };
      }
    }

    const updatedFields = { 'status': { stringValue: "CONCLUIDO" }, 'timestamp_retorno': { timestampValue: new Date().toISOString() }, 'seguranca_retorno': { stringValue: sessao.seguranca }, 'km_retorno': { stringValue: String(kmRet) } };
    const updateMask = ['status', 'timestamp_retorno', 'seguranca_retorno', 'km_retorno'];
    if (!patchDocumentInFirestore_('frota_movimentacao', p.documentId, updatedFields, updateMask)) return { ok: false, message: "Falha ao registrar entrada no Firestore." };
    
    CacheService.getScriptCache().remove("firestore_frota_data_v2");
    return { ok: true, seguranca: sessao.seguranca };
}

function getKmAtual(veiculo) {
    const frotaData = getFrotaDataFromFirestore_();
    if (frotaData.ok && frotaData.ultimosKm[veiculo]) return { ok: true, km: frotaData.ultimosKm[veiculo] };
    return { ok: true, km: 0 };
}

function getDashboardAndLists() {
    const frotaData = getFrotaDataFromFirestore_();
    const listas = getListasFrota();
    if (!frotaData.ok) return { ok: true, recentes: [], veiculosNaRua: [], veiculos: listas.veiculos, motoristas: listas.motoristas, segurancas: listas.segurancas };
    
    const emTransitoSet = new Set(frotaData.veiculosNaRua.map(v => v.veiculo));
    return {
        ok: true,
        recentes: frotaData.recentes.map(r => ({ veiculo: r.veiculo, motorista: r.motorista, status: r.status, dataHora: r.timestamp_retorno || r.timestamp_saida })),
        veiculosNaRua: frotaData.veiculosNaRua.map(r => ({ documentId: r.id, veiculo: r.veiculo, motorista: r.motorista, seguranca: r.seguranca_saida, kmSaida: r.km_saida })),
        veiculos: listas.veiculos.filter(v => !emTransitoSet.has(v)),
        motoristas: listas.motoristas,
        segurancas: listas.segurancas
    };
}

function getBootstrapSaida() {
    const frotaData = getFrotaDataFromFirestore_();
    const listas = getListasFrota();
    let veiculosDisponiveis = listas.veiculos, kmMap = {};
    if (frotaData.ok) {
        const emTransitoSet = new Set(frotaData.veiculosNaRua.map(v => v.veiculo));
        veiculosDisponiveis = listas.veiculos.filter(v => !emTransitoSet.has(v));
        kmMap = frotaData.ultimosKm;
    }
    return { ok: true, veiculos: veiculosDisponiveis, motoristas: listas.motoristas, segurancas: listas.segurancas, kmMap };
}

function getBootstrapEntrada() {
    const frotaData = getFrotaDataFromFirestore_();
    const listas = getListasFrota();
    let veiculosNaRua = [];
    if (frotaData.ok) {
        veiculosNaRua = frotaData.veiculosNaRua.map(r => ({ documentId: r.id, veiculo: r.veiculo, motorista: r.motorista, seguranca: r.seguranca_saida, kmSaida: r.km_saida }));
    }
    return { ok: true, veiculosNaRua, motoristas: listas.motoristas };
}
