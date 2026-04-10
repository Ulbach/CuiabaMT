/**
 * Serviço central para acesso às listas fixas do projeto.
 * Mantém a mesma ideia de catálogo, mas sem ler a aba de listas em tempo real.
 */

function normalizarListaTexto_(lista) {
  return [...new Set(
    (lista || [])
      .map(function(item) {
        // Durante a migração, algumas listas podem vir como objeto ({ nome, ... }).
        var valor = (item && typeof item === "object") ? (item.nome || item.name || "") : item;
        return String(valor || "").trim();
      })
      .filter(Boolean)
  )].sort(function(a, b) {
    return a.localeCompare(b, "pt-BR");
  });
}

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

function getListaVeiculosFixos() {
  return normalizarListaTexto_(LISTA_VEICULOS);
}

function getListaMotoristasFixos() {
  return normalizarListaTexto_(
    (LISTA_MOTORISTAS || [])
      .filter(function(item) { return cnhListaFixaValida_(item && item.validadeCnh); })
      .map(function(item) { return item && item.nome; })
  );
}

function getListaSegurancasFixos() {
  return normalizarListaTexto_(LISTA_SEGURANCAS);
}

/**
 * Use esta função no Código.gs no lugar da leitura da aba Listagem2.
 */
function getListasFrotaFixas() {
  return {
    veiculos: getListaVeiculosFixos(),
    motoristas: getListaMotoristasFixos(),
    segurancas: getListaSegurancasFixos()
  };
}
