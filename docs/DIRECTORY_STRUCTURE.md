# Estrutura de Diretorios

## Raiz

- `README.md`: visao geral e comandos essenciais.
- `AGENTS.md`: instrucoes permanentes para IAs.
- `firebase.json`: Hosting e Firestore Rules.
- `.firebaserc`: projeto Firebase e target `cuiabamt`.
- `firestore.rules`: regras de seguranca.
- `package.json`: scripts npm.
- `vite.config.ts`: configuracao Vite.

## `public/`

Pasta publicada no Firebase Hosting.

- `index.html`: login, menu principal e troca de senha.
- `admin.html`: menu administrativo.
- `veiculos.html`: painel de frota.
- `saida.html`: registro de saida.
- `entrada.html`: registro de entrada/retorno.
- `visitantes.html`: painel de visitantes.
- `Entrada_visitante.html`: entrada de visitante.
- `Saida_visitante.html`: saida de visitante.
- `agenda.html`: agenda.
- `cad_*.html`: cadastros administrativos.
- `relatorio_visitantes.html`: relatorio de visitas.

## `public/relatorios/`

Central e relatorios de CNH, noturno, operacional, resumo, segurancas, lista de acessos e log de acessos.

## `scripts/`

Scripts locais de backup, diagnostico, reparo e validacao. Usar com cautela em producao.

## `src/`

Contem arquivos TypeScript e Apps Script legados. Uso atual em producao: A confirmar.

## `docs/`

Documentacao permanente e historico de mudancas.
