/**
 * SERVIÇO CENTRAL PARA ACESSO ÀS LISTAS FIXAS DO PROJETO.
 *
 * Este arquivo é obrigatório quando o Code.gs chama:
 * - getListasFrotaFixas()
 * - getMapaCodigosSegurancasFixos()
 *
 * As listas devem existir nos arquivos:
 * - listas_veiculos.gs      -> var LISTA_VEICULOS = [...]
 * - listas_motoristas.gs    -> var LISTA_MOTORISTAS = [{ nome, validadeCnh }, ...]
 * - listas_segurancas.gs    -> var LISTA_SEGURANCAS = [{ nome, codigo }, ...]
 */

/* ================= ACESSO SEGURO ÀS LISTAS GLOBAIS ================= */

function getListaVeiculosRaw_() {
  return (typeof LISTA_VEICULOS !== "undefined" && Array.isArray(LISTA_VEICULOS))
    ? LISTA_VEICULOS
    : [];
}

function getListaMotoristasRaw_() {
  return (typeof LISTA_MOTORISTAS !== "undefined" && Array.isArray(LISTA_MOTORISTAS))
    ? LISTA_MOTORISTAS
    : [];
}

function getListaSegurancasRaw_() {
  return (typeof LISTA_SEGURANCAS !== "undefined" && Array.isArray(LISTA_SEGURANCAS))
    ? LISTA_SEGURANCAS
    : [];
}

/* ================= NORMALIZAÇÃO ================= */

function normalizarListaTexto_(lista) {
  return Array.from(new Set(
    (lista || [])
      .map(function(item) {
        var valor = (item && typeof item === "object")
          ? (item.nome || item.name || "")
          : item;

        return String(valor || "").trim();
      })
      .filter(Boolean)
  )).sort(function(a, b) {
    return a.localeCompare(b, "pt-BR");
  });
}

/* ================= DATAS / CNH ================= */

function parseDataListaFixa_(texto) {
  if (!texto) return null;

  var m = String(texto).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function hojeNormalizado_() {
  var d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function cnhListaFixaValida_(texto) {
  var d = parseDataListaFixa_(texto);
  if (!d) return false;
  return d.getTime() >= hojeNormalizado_().getTime();
}

/* ================= LISTAS PARA O APP ================= */

function getListaVeiculosFixos() {
  return normalizarListaTexto_(getListaVeiculosRaw_());
}

function getListaMotoristasFixos() {
  return normalizarListaTexto_(
    getListaMotoristasRaw_()
      .filter(function(item) {
        return item && cnhListaFixaValida_(item.validadeCnh);
      })
      .map(function(item) {
        return item && item.nome;
      })
  );
}

function getListaSegurancasFixos() {
  return normalizarListaTexto_(
    getListaSegurancasRaw_().map(function(item) {
      return item && item.nome;
    })
  );
}

/* ================= LOGIN / SEGURANÇAS ================= */

function getMapaCodigosSegurancasFixos() {
  var mapa = {};

  getListaSegurancasRaw_().forEach(function(item) {
    if (!item || typeof item !== "object") return;

    var codigo = String(item.codigo || "").trim();
    var nome = String(item.nome || item.name || "").trim();

    if (codigo && nome) {
      mapa[codigo] = nome;
    }
  });

  return mapa;
}

/* ================= OBJETO CENTRAL DE LISTAS ================= */

function getListasFrotaFixas() {
  return {
    veiculos: getListaVeiculosFixos(),
    motoristas: getListaMotoristasFixos(),
    segurancas: getListaSegurancasFixos()
  };
}

/* Compatibilidade com versões antigas do Code.gs, caso alguma função ainda chame getListasFrota(). */
function getListasFrota() {
  return getListasFrotaFixas();
}
