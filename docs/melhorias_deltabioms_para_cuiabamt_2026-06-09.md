# Melhorias replicadas do DeltaBIOMS para CuiabaMT

Data: 2026-06-09

## Objetivo

Replicar no projeto CuiabaMT as melhorias tecnicas observadas no DeltaBIOMS, sem misturar bancos de dados, credenciais, projetos Firebase ou fluxos de visitantes.

## Escopo aplicado

- Validacao especial de KM no retorno de veiculos em `public/entrada.html`.
- Relatorio operacional com KM inicial, KM final, KM rodados e seguranca de saida/retorno.
- Relatorio de CNH com leitura de campos adicionais e texto de dias restantes mais claro.
- Registro de logout em `logs_acesso` nos relatorios alterados.
- Header `Cache-Control: no-cache` para arquivos HTML no Firebase Hosting.
- Scripts auxiliares de Firebase em `package.json`.

## Escopo propositalmente nao aplicado

As alteracoes de Menu Visitantes, pre-cadastro, controlDelta, iDFace e iDSecure do DeltaBIOMS nao foram replicadas.

Nao foram copiados:

- `public/idface_pre_cadastro.html`
- `public/idface_auditoria.html`
- `docs/INTEGRACAO_CONTROLDELTA.md`
- `scripts/idface-bridge.mjs`
- configuracoes `IDFACE_*` ou `IDSECURE_*`
- Firebase `deltabioms`
- Firebase `controldelta`

## Cuidados com banco de dados

O CuiabaMT permanece usando exclusivamente o Firebase:

- `projectId`: `cuiaba-01617931-f126e`
- storage/auth do projeto CuiabaMT
- storage keys locais `delta_auth_firebase_v1`, `delta_auth_v1`, `delta_log_acesso_id_v1` e `delta_log_acesso_inicio_v1`

Nao houve alteracao em:

- `public/js/firebase.js`
- `.env.example`
- `.firebaserc`
- `src/firebase.ts`

## Arquivos alterados

- `firebase.json`
- `package.json`
- `public/entrada.html`
- `public/relatorios/relatorio_cnh.html`
- `public/relatorios/relatorio_operacional.html`

## Detalhes tecnicos

### Retorno de veiculos

Foi adicionada regra operacional por modelo:

- GOL: bloqueia retorno com diferenca acima de 600 km em relacao ao KM de saida.
- AMAROK: exige senha diaria quando a diferenca passa de 2.000 km.

A regra antiga de bloquear KM de retorno menor que KM de saida foi preservada.

### Relatorio operacional

O relatorio agora:

- mostra KM inicial, KM final e KM rodados;
- calcula KM rodados quando o campo nao vem pronto no Firestore;
- aceita variacoes de nomes de campos antigos e novos;
- exibe seguranca de saida e retorno;
- exporta CSV com as novas colunas.

### Relatorio CNH

O relatorio agora:

- aceita `Val_CNH`, `val_CNH` e `val_cnh`, alem dos campos anteriores;
- mostra dias como texto operacional, por exemplo `Vence hoje` ou `Vencida ha 3 dias`;
- exporta CSV com o mesmo texto exibido na tela.

### Hosting

Foi incluido `Cache-Control: no-cache` para `**/*.html` no `firebase.json`, mantendo `target: cuiabamt`.

## Validacoes executadas

- `npm run build`
- `git diff --check`
- checagem sintatica dos scripts embutidos em:
  - `public/entrada.html`
  - `public/relatorios/relatorio_operacional.html`
  - `public/relatorios/relatorio_cnh.html`
- varredura por referencias indevidas a `DeltaBIOMS`, `deltabioms`, `controlDelta`, `controldelta`, `delta-ms`, `IDFACE_`, `IDSECURE_` e chaves conhecidas do DeltaBIOMS.
- verificacao local via `http://127.0.0.1:3004` sem erros de console nas telas protegidas por login.

## Resultado esperado

O CuiabaMT recebe as melhorias operacionais do DeltaBIOMS mantendo seu proprio banco, identidade e configuracoes de ambiente.
