/**
 * DELTA PRO CUIABA - SISTEMA UNIFICADO (FROTA & VISITANTES)
 * VERSAO COM LISTAS FIXAS REAIS
 */

const PLANILHA_ID = "1h1kgl9w6UL8JlxMvlywJM1AIthU_U1dGzQ84JicrlOU";
const ABA_DADOS_FROTA = "App_Controle2";
const ABA_VISITANTES = "Visitantes";

const CACHE_KEY_DASHBOARD = "frota_dashboard_lists_v1";
const CACHE_KEY_HOME_FAST = "frota_home_fast_v2";
const CACHE_KEY_SAIDA_BOOTSTRAP = "frota_saida_bootstrap_v1";
const CACHE_KEY_ENTRADA_BOOTSTRAP = "frota_entrada_bootstrap_v1";
const CACHE_TTL_SEGUNDOS = 20;

const SESSION_PREFIX = "sessao_seguranca_";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const MAX_LINHAS_DASHBOARD = 180;
const MAX_LINHAS_BUSCA_OPERACIONAL = 400;
const TOTAL_COLUNAS_FROTA = 10;

/* ================= LISTAS FIXAS ================= */

const LISTA_VEICULOS = [
  "Amarok - QCH7131",
  "Gol Prata - QCH7171",
  "Gol Prata - QCI3271"
];

const LISTA_MOTORISTAS = [
  { nome: "ELIESER DA SILVA SANTOS", validadeCnh: "17/12/2023" },
  { nome: "EDINEY MOREIRA DOS SANTOS", validadeCnh: "10/11/2034" },
  { nome: "THACITO MARCELO DE PAULA FERREIRA", validadeCnh: "06/12/2032" },
  { nome: "GUILHERME AUGUSTO MARTINS DA SILVA", validadeCnh: "19/06/2033" },
  { nome: "PAULO SERGIO DOS SANTOS", validadeCnh: "22/01/2035" },
  { nome: "VALDEMIR FERREIRA PINTO", validadeCnh: "10/04/2032" },
  { nome: "ANTTONIELLY ANGELINA BEZ BATTI ARCANJO", validadeCnh: "31/08/2033" },
  { nome: "FABRICIO FRANCISCO DE OLIVEIRA", validadeCnh: "03/08/2032" },
  { nome: "LEONARDO SANTOS FADIGAS DE SOUZA", validadeCnh: "08/07/2031" },
  { nome: "SIDNEY VICENTE DA SILVA", validadeCnh: "06/01/2035" },
  { nome: "THOMAZ FRAZATTO CARRARA", validadeCnh: "27/08/2035" },
  { nome: "VICTOR MATHEUS CARVALHO PLENS", validadeCnh: "09/06/2032" }
];

const LISTA_SEGURANCAS = [
  { nome: "PATRICK HALISSON DE BARROS TORALES", codigo: "1122" },
  { nome: "RONALDO ESTRAL SANTANA", codigo: "3344" },
  { nome: "OPERADOR ULBACH", codigo: "5566" }
];

/* ================= LISTAS FIXAS - SERVICE ================= */

function normalizarListaTexto_(lista) {
  return [...new Set(
    (lista || [])
      .map(function(item) { return String(item || "").trim(); })
      .filter(Boolean)
  )].sort(function(a, b) {
    return a.localeCompare(b, "pt-BR");
  });
}

function parseDataListaFixa_(texto) {
  if (!texto) return null;
  const m = String(texto).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function hojeNormalizado_() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function cnhListaFixaValida_(texto) {
  const d = parseDataListaFixa_(texto);
  if (!d) return false;
  return d.getTime() >= hojeNormalizado_().getTime();
}

function getListaVeiculosFixos() {
  return normalizarListaTexto_(LISTA_VEICULOS);
}

function getListaMotoristasFixos() {
  return normalizarListaTexto_(
    (LISTA_MOTORISTAS || [])
      .filter(function(item) { return cnhListaFixaValida_(item.validadeCnh); })
      .map(function(item) { return item.nome; })
  );
}

function getListaSegurancasFixos() {
  return normalizarListaTexto_(
    (LISTA_SEGURANCAS || []).map(function(item) { return item.nome; })
  );
}

function getMapaCodigosSegurancasFixos() {
  const mapa = {};
  (LISTA_SEGURANCAS || []).forEach(function(item) {
    const codigo = String(item.codigo || "").trim();
    const nome = String(item.nome || "").trim();
    if (codigo && nome) mapa[codigo] = nome;
  });
  return mapa;
}

function getListasFrota() {
  return {
    veiculos: getListaVeiculosFixos(),
    motoristas: getListaMotoristasFixos(),
    segurancas: getListaSegurancasFixos()
  };
}

/* ================= CORE ================= */

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  const route = p.route || "";
  const callback = p.callback || "callback";
  let result;

  try {
    if (route === "loginSeguranca") result = loginSeguranca(p.codigo);
    else if (route === "validarSessao") result = validarSessaoSeguranca(p.token);
    else if (route === "logoutSeguranca") result = logoutSeguranca(p.token);

    else if (route === "bootstrapVeiculos") result = getBootstrapVeiculos();
    else if (route === "bootstrapSaida") result = getBootstrapSaida();
    else if (route === "bootstrapEntrada") result = getBootstrapEntrada();

    else if (route === "home" || route === "listsAvail") result = getDashboardAndLists();
    else if (route === "homeFast") result = getDashboardFast();
    else if (route === "veiculosAvail") result = getVeiculosAvail();
    else if (route === "apoioSaida") result = getApoioSaida();
    else if (route === "kmAtual") result = getKmAtual(p.veiculo);
    else if (route === "saida") result = registrarSaidaFrota(p);
    else if (route === "entrada") result = registrarEntradaFrota(p);
    else if (route === "getVisitantesData") result = getVisitantesData();
    else if (route === "salvarVisitante") result = salvarVisitante(p.data);
    else result = { ok: false, message: "Rota desconhecida" };
  } catch (err) {
    result = { ok: false, message: err && err.toString ? err.toString() : String(err) };
  }

  return ContentService
    .createTextOutput(callback + "(" + JSON.stringify(result) + ")")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/* ================= LOGIN / SESSAO ================= */

function normalizarTextoSeguranca(v) {
  return String(v || "").trim();
}

function gerarTokenSessao() {
  return Utilities.getUuid().replace(/-/g, "") + "_" + new Date().getTime();
}

function getSessaoKey(token) {
  return SESSION_PREFIX + String(token || "").trim();
}

function buscarSegurancaPorCodigo(codigo) {
  const alvo = String(codigo == null ? "" : codigo).trim();
  if (!alvo) return null;

  const mapa = getMapaCodigosSegurancasFixos();
  const seguranca = mapa[alvo];
  if (!seguranca) return null;

  return { seguranca: seguranca, codigo: alvo };
}

function salvarSessaoSeguranca(token, payload) {
  PropertiesService.getScriptProperties().setProperty(getSessaoKey(token), JSON.stringify(payload));
}

function lerSessaoSeguranca(token) {
  const tk = String(token || "").trim();
  if (!tk) return null;

  const raw = PropertiesService.getScriptProperties().getProperty(getSessaoKey(tk));
  if (!raw) return null;

  var sessao;
  try {
    sessao = JSON.parse(raw);
  } catch (e) {
    PropertiesService.getScriptProperties().deleteProperty(getSessaoKey(tk));
    return null;
  }

  if (!sessao || !sessao.expiraEm || Number(sessao.expiraEm) < Date.now()) {
    PropertiesService.getScriptProperties().deleteProperty(getSessaoKey(tk));
    return null;
  }

  return sessao;
}

function removerSessaoSeguranca(token) {
  const tk = String(token || "").trim();
  if (!tk) return;
  PropertiesService.getScriptProperties().deleteProperty(getSessaoKey(tk));
}

function loginSeguranca(codigo) {
  const codigoInformado = String(codigo == null ? "" : codigo).trim();
  if (!codigoInformado) return { ok: false, message: "Informe o codigo de acesso." };

  const cadastro = buscarSegurancaPorCodigo(codigoInformado);
  if (!cadastro) return { ok: false, message: "Codigo invalido." };

  const token = gerarTokenSessao();
  const agora = Date.now();
  const payload = {
    token: token,
    seguranca: cadastro.seguranca,
    criadoEm: agora,
    expiraEm: agora + SESSION_TTL_MS
  };

  salvarSessaoSeguranca(token, payload);

  return {
    ok: true,
    token: token,
    seguranca: cadastro.seguranca,
    expiraEm: payload.expiraEm,
    message: "Ola, " + cadastro.seguranca + "!"
  };
}

function validarSessaoSeguranca(token) {
  const sessao = lerSessaoSeguranca(token);
  if (!sessao) return { ok: false, autenticado: false, message: "Sessao invalida ou expirada." };

  return {
    ok: true,
    autenticado: true,
    seguranca: sessao.seguranca,
    expiraEm: sessao.expiraEm
  };
}

function logoutSeguranca(token) {
  removerSessaoSeguranca(token);
  return { ok: true };
}

function exigirSessaoSeguranca(token) {
  const sessao = lerSessaoSeguranca(token);
  if (!sessao) throw new Error("Sessao invalida ou expirada.");
  return sessao;
}

/* ================= VISITANTES ================= */

function getVisitantesData() {
  const sh = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(ABA_VISITANTES);
  const dados = sh.getDataRange().getValues();

  const visitantes = dados.slice(1).map((r, i) => ({
    linha: i + 2,
    cpf: String(r[1]).replace(/\D/g, ""),
    nome: String(r[2]),
    telefone: String(r[3]),
    status: String(r[4])
  })).filter(v => v.cpf && v.cpf !== "undefined");

  const responsaveis = [...new Set(dados.slice(1).map(r => r[7]).filter(Boolean))];
  return { ok: true, visitantes, responsaveis };
}

function salvarVisitante(jsonData) {
  const p = JSON.parse(decodeURIComponent(jsonData));
  const token = p.token || "";
  let seguranca = String(p.seguranca || "").trim();

  if (token) {
    const sessao = lerSessaoSeguranca(token);
    if (!sessao) return { ok: false, message: "Sessao invalida ou expirada." };
    seguranca = String(sessao.seguranca || seguranca || "").trim();
  }

  const sh = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(ABA_VISITANTES);

  if (p.tipo === "SAIDA") {
    sh.getRange(p.linha, 5).setValue("CONCLUIDO");
    sh.getRange(p.linha, 7).setValue(new Date());
    sh.getRange(p.linha, 9).setValue(seguranca);
  } else {
    sh.appendRow([new Date(), p.cpf, p.nome, p.telefone, "EM VISITA", p.responsavel, "", "", seguranca]);
  }

  return { ok: true, seguranca: seguranca };
}

/* ================= FROTA - HELPERS ================= */

function normalizarTexto(v) {
  return String(v == null ? "" : v)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function mesmoVeiculo(a, b) {
  return normalizarTexto(a) === normalizarTexto(b);
}

function statusEmTransito(v) {
  return normalizarTexto(v) === "EM TRANSITO";
}

function parseNumeroSeguro(v) {
  if (v === null || v === undefined || v === "") return 0;
  const texto = String(v).trim();
  if (/^\d+(?:\.\d+)?$/.test(texto)) return Number(texto) || 0;
  const n = Number(texto.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function getFaixaUltimasLinhas(sheet, maxLinhas, totalColunas) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { startRow: 2, numRows: 0, values: [], displayValues: [] };

  const startRow = Math.max(2, lastRow - maxLinhas + 1);
  const numRows = lastRow - startRow + 1;

  return {
    startRow: startRow,
    numRows: numRows,
    values: sheet.getRange(startRow, 1, numRows, totalColunas).getValues(),
    displayValues: sheet.getRange(startRow, 1, numRows, totalColunas).getDisplayValues()
  };
}

function cachePutSeguro(cache, key, obj) {
  try {
    const texto = JSON.stringify(obj);
    if (texto.length > 95000) return false;
    cache.put(key, texto, CACHE_TTL_SEGUNDOS);
    return true;
  } catch (e) {
    return false;
  }
}

function getMapaUltimoKm(dados) {
  const mapa = {};
  for (let i = dados.length - 1; i >= 0; i--) {
    const veiculo = String(dados[i][0] || "").trim();
    if (!veiculo || mapa[veiculo] !== undefined) continue;
    mapa[veiculo] = parseNumeroSeguro(dados[i][7]) || parseNumeroSeguro(dados[i][3]) || 0;
  }
  return mapa;
}

/* ================= FROTA - DASHBOARD ================= */

function getDashboardAndLists() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY_DASHBOARD);
  if (cached) {
    try { return JSON.parse(cached); } catch (_) {}
  }

  const shDados = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(ABA_DADOS_FROTA);
  const faixa = getFaixaUltimasLinhas(shDados, MAX_LINHAS_DASHBOARD, TOTAL_COLUNAS_FROTA);
  const dados = faixa.displayValues;

  const veiculosNaRua = [];
  for (let i = dados.length - 1; i >= 0; i--) {
    const r = dados[i];
    if (!r[0]) continue;
    if (statusEmTransito(r[6])) {
      veiculosNaRua.push({
        veiculo: r[0],
        motorista: r[1],
        seguranca: r[2],
        kmSaida: r[3]
      });
    }
  }

  const recentes = dados
    .filter(r => r[0])
    .slice(-5)
    .reverse()
    .map(r => ({
      veiculo: r[0],
      motorista: r[1],
      status: r[6],
      dataHora: r[9] || r[5] || "---"
    }));

  const listas = getListasFrota();
  const emTransitoSet = new Set(veiculosNaRua.map(x => String(x.veiculo).trim()));

  const result = {
    ok: true,
    recentes: recentes,
    veiculosNaRua: veiculosNaRua,
    veiculos: listas.veiculos.filter(v => !emTransitoSet.has(v)),
    motoristas: listas.motoristas,
    segurancas: listas.segurancas
  };

  cachePutSeguro(cache, CACHE_KEY_DASHBOARD, result);
  return result;
}

function getDashboardFast() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY_HOME_FAST);
  if (cached) {
    try { return JSON.parse(cached); } catch (_) {}
  }

  const shDados = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(ABA_DADOS_FROTA);
  const faixa = getFaixaUltimasLinhas(shDados, 30, TOTAL_COLUNAS_FROTA);
  const dados = faixa.displayValues;

  const recentes = dados
    .filter(r => r[0])
    .slice(-5)
    .reverse()
    .map(r => ({
      veiculo: r[0],
      motorista: r[1],
      status: r[6],
      dataHora: r[9] || r[5] || "---"
    }));

  const result = { ok: true, recentes: recentes };
  cachePutSeguro(cache, CACHE_KEY_HOME_FAST, result);
  return result;
}

function getVeiculosAvail() {
  const data = getDashboardAndLists();
  return { ok: true, veiculos: data.veiculos || [] };
}

function getApoioSaida() {
  const data = getDashboardAndLists();
  return { ok: true, motoristas: data.motoristas || [], segurancas: data.segurancas || [] };
}

function getBootstrapVeiculos() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY_HOME_FAST);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return { ok: true, recentes: parsed.recentes || [] };
    } catch (_) {}
  }
  return getDashboardFast();
}

function getBootstrapSaida() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY_SAIDA_BOOTSTRAP);
  if (cached) {
    try { return JSON.parse(cached); } catch (_) {}
  }

  const shDados = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(ABA_DADOS_FROTA);
  const faixa = getFaixaUltimasLinhas(shDados, MAX_LINHAS_BUSCA_OPERACIONAL, TOTAL_COLUNAS_FROTA);
  const dados = faixa.values;
  const listas = getListasFrota();
  const kmMap = getMapaUltimoKm(dados);

  const emTransitoSet = new Set();
  for (let i = dados.length - 1; i >= 0; i--) {
    const r = dados[i];
    const veiculo = String(r[0] || "").trim();
    if (veiculo && statusEmTransito(r[6])) emTransitoSet.add(veiculo);
  }

  const result = {
    ok: true,
    veiculos: listas.veiculos.filter(v => !emTransitoSet.has(v)),
    motoristas: listas.motoristas,
    segurancas: listas.segurancas,
    kmMap: kmMap
  };

  cachePutSeguro(cache, CACHE_KEY_SAIDA_BOOTSTRAP, result);
  return result;
}

function getBootstrapEntrada() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY_ENTRADA_BOOTSTRAP);
  if (cached) {
    try { return JSON.parse(cached); } catch (_) {}
  }

  const shDados = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(ABA_DADOS_FROTA);
  const faixa = getFaixaUltimasLinhas(shDados, MAX_LINHAS_BUSCA_OPERACIONAL, TOTAL_COLUNAS_FROTA);
  const dados = faixa.displayValues;
  const listas = getListasFrota();

  const veiculosNaRua = [];
  for (let i = dados.length - 1; i >= 0; i--) {
    const r = dados[i];
    if (!r[0]) continue;
    if (statusEmTransito(r[6])) {
      veiculosNaRua.push({
        veiculo: r[0],
        motorista: r[1],
        seguranca: r[2],
        kmSaida: r[3]
      });
    }
  }

  const result = {
    ok: true,
    veiculosNaRua: veiculosNaRua,
    motoristas: listas.motoristas
  };

  cachePutSeguro(cache, CACHE_KEY_ENTRADA_BOOTSTRAP, result);
  return result;
}

/* ================= FROTA - OPERACAO ================= */

function limparCacheDashboard() {
  const cache = CacheService.getScriptCache();
  cache.remove(CACHE_KEY_DASHBOARD);
  cache.remove(CACHE_KEY_HOME_FAST);
  cache.remove(CACHE_KEY_SAIDA_BOOTSTRAP);
  cache.remove(CACHE_KEY_ENTRADA_BOOTSTRAP);
}

function registrarSaidaFrota(p) {
  const sessao = exigirSessaoSeguranca(p.token);
  const sh = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(ABA_DADOS_FROTA);

  const faixa = getFaixaUltimasLinhas(sh, MAX_LINHAS_BUSCA_OPERACIONAL, TOTAL_COLUNAS_FROTA);
  const dados = faixa.values;

  for (let i = dados.length - 1; i >= 0; i--) {
    const r = dados[i];
    if (mesmoVeiculo(r[0], p.veiculo) && statusEmTransito(r[6])) {
      return { ok: false, message: "Veiculo ja esta em transito." };
    }
  }

  sh.appendRow([
    p.veiculo,
    p.motorista,
    sessao.seguranca,
    parseNumeroSeguro(p.KmSaida || p.kmSaida),
    p.destino,
    new Date(),
    "EM TRANSITO",
    "",
    "",
    ""
  ]);

  limparCacheDashboard();
  return { ok: true, seguranca: sessao.seguranca };
}

function registrarEntradaFrota(p) {
  const sessao = exigirSessaoSeguranca(p.token);
  const sh = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(ABA_DADOS_FROTA);

  const faixa = getFaixaUltimasLinhas(sh, MAX_LINHAS_BUSCA_OPERACIONAL, TOTAL_COLUNAS_FROTA);
  const data = faixa.values;
  const startRow = faixa.startRow;

  for (let i = data.length - 1; i >= 0; i--) {
    if (mesmoVeiculo(data[i][0], p.veiculo) && statusEmTransito(data[i][6])) {
      const linha = startRow + i;
      const kmSai = parseNumeroSeguro(data[i][3]);
      const kmRet = parseNumeroSeguro(p.KmRetorno || p.kmRetorno);

      if (kmRet < kmSai) {
        return { ok: false, message: "KM de retorno inferior ao KM de saida." };
      }

      sh.getRange(linha, 3).setValue(sessao.seguranca);
      sh.getRange(linha, 7).setValue("CONCLUIDO");
      sh.getRange(linha, 8).setValue(kmRet);
      sh.getRange(linha, 9).setValue(kmRet - kmSai);
      sh.getRange(linha, 10).setValue(new Date());

      limparCacheDashboard();
      return { ok: true, seguranca: sessao.seguranca };
    }
  }

  return { ok: false, message: "Veiculo nao encontrado em transito." };
}

function getKmAtual(veiculo) {
  const sh = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(ABA_DADOS_FROTA);
  const faixa = getFaixaUltimasLinhas(sh, MAX_LINHAS_BUSCA_OPERACIONAL, TOTAL_COLUNAS_FROTA);
  const data = faixa.values;

  for (let i = data.length - 1; i >= 0; i--) {
    if (mesmoVeiculo(data[i][0], veiculo)) {
      return { ok: true, km: parseNumeroSeguro(data[i][7]) || parseNumeroSeguro(data[i][3]) || 0 };
    }
  }
  return { ok: true, km: 0 };
}
