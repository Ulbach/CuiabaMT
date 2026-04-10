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

function getListaVeiculosFixos() {
  return normalizarListaTexto_(LISTA_VEICULOS);
}

function getListaMotoristasFixos() {
  return normalizarListaTexto_(LISTA_MOTORISTAS);
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
