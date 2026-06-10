# Fase 0 - Inventario de Seguranca

Data: 2026-06-10

## Estado Atual

- Branch de trabalho: `codex/replica-melhorias-deltabioms-cuiaba`.
- Projeto Firebase: `cuiaba-01617931-f126e`.
- Hosting target: `cuiabamt`.
- Regras Firestore atuais: abertas para leitura e escrita durante testes.
- Conta administrativa principal: marcada no banco como protegida.

## Colecoes Identificadas

- `segurancas`
- `veiculos`
- `motoristas`
- `responsaveis`
- `movimentacoes_frota`
- `logs_acesso`
- `visitantes`
- `frota_veiculos`
- `frota_motoristas`

## Pontos Sensiveis

- `segurancas.Sen_Segura` ainda e usado como credencial em texto puro.
- `public/index.html` valida login consultando e-mail e senha direto no Firestore.
- `public/cad_segurancas.html` permite cadastro/edicao de segurancas.
- `public/relatorios/lista_acessos.html` ainda lista/exporta senhas de operadores.
- `firestore.rules` esta com `allow read, write: if true`.

## Decisao Para Proxima Fase

A Fase 1 deve criar Firebase Auth em paralelo, sem fechar o banco ainda. As regras so devem ser publicadas depois de login por perfil, operacoes e relatorios passarem nos testes.
