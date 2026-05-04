/**
 * SERVIÇO CENTRAL DE LISTAS FIXAS
 * Responsável por normalizar, validar e expor as listas do sistema.
 */

/* ================= NORMALIZAÇÃO ================= */

function normalizarListaTexto_(lista) {
  return [...new Set(
    (lista || [])
      .map(function(item) {
        var valor = (item && typeof item === "object")
          ? (item.nome || item.name || "")
          : item;

        return String(valor || "").trim();
      })
      .filter(Boolean)
  )].sort(function(a, b) {
    return a.localeCompare(b, "pt-BR");
  });
}

/* ================= DATAS / CNH ================= */

function parseDataListaFixa_(texto) {
  if (!texto) return null;

  var m = String(texto).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  return new Date(
    Number(m[3]),
    Number(m[2]) - 1,
    Number(m[1])
  );
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

/* ================= LISTAS ================= */

function getListaVeiculosFixos() {
  return normalizarListaTexto_(LISTA_VEICULOS);
}

function getListaMotoristasFixos() {
  return normalizarListaTexto_(
    (LISTA_MOTORISTAS || [])
      .filter(function(item) {
        return cnhListaFixaValida_(item && item.validadeCnh);
      })
      .map(function(item) {
        return item && item.nome;
      })
  );
}

function getListaSegurancasFixos() {
  return normalizarListaTexto_(
    (LISTA_SEGURANCAS || []).map(function(item) {
      return item && item.nome;
    })
  );
}

/* ================= LOGIN ================= */

function getMapaCodigosSegurancasFixos() {
  var mapa = {};

  (LISTA_SEGURANCAS || []).forEach(function(item) {
    var codigo = "";
    var nome = "";

    if (item && typeof item === "object") {
      codigo = String(item.codigo || "").trim();
      nome = String(item.nome || item.name || "").trim();
    }

    if (codigo && nome) {
      mapa[codigo] = nome;
    }
  });

  return mapa;
}

/* ================= FROTA ================= */

function getListasFrotaFixas() {
  return {
    veiculos: getListaVeiculosFixos(),
    motoristas: getListaMotoristasFixos(),
    segurancas: getListaSegurancasFixos()
  };
}
