# Varredura de pontas soltas - 2026-06-17

## Objetivo

Reduzir falhas intermitentes de permissão em telas que consultam o Firestore logo após a navegação.

O problema encontrado era semelhante ao corrigido nos relatórios: a tela validava a sessão salva no `localStorage`, mas consultava o Firestore antes do Firebase Auth restaurar o usuário real do navegador. Nessa janela, as regras recebem `request.auth == null` e retornam `Missing or insufficient permissions`.

## Correções aplicadas

- Adicionada espera explícita de Firebase Auth com `onAuthStateChanged` antes de consultas/gravações nas telas:
  - `veiculos.html`
  - `entrada.html`
  - `saida.html`
  - `visitantes.html`
  - `Entrada_visitante.html`
  - `Saida_visitante.html`
  - `cad_motoristas.html`
  - `cad_responsaveis.html`
  - `cad_segurancas.html`
  - `cad_veiculos.html`

- Cada tela agora compara o `uid` da sessão local com o usuário restaurado no Firebase Auth. Se não houver usuário Auth ou se o `uid` não bater, a sessão local é limpa e o usuário volta ao login.

- `relatorios/lista_acessos.html`
  - A coluna de senha temporária/troca pendente passou a usar `MustChangePassword`.
  - Mantida compatibilidade com o campo legado `SenhaTemporaria`.

## Testes executados

```powershell
npm run build
node scripts/verify-security-rules.mjs
node scripts/verify-no-legacy-password-field.mjs
```

Também foram testados:

- Carregamento HTTP local das principais telas operacionais e relatórios.
- Varredura estática para confirmar `onAuthStateChanged`, `firebaseAuth` e `await garantirFirebaseAuth(...)` nas telas corrigidas.
- Leitura real com SuperAdmin em `logs_acesso`, `segurancas` e `veiculos`.

Resultados:

- Build: OK.
- Regras Firestore: OK.
- Campo legado `Sen_Segura`: ausente nos documentos verificados.
- Leitura autenticada com SuperAdmin: OK.
- O `permission-denied` exibido no teste de regras é esperado no caso "CONSULTA não cria motorista".

## Fora desta entrega

A redefinição administrativa real de senha ainda depende de uma Cloud Function/Admin SDK. A tela atual continua com a contenção operacional já existente para usuários com Auth existente. Essa mudança deve ser feita em uma etapa separada, com testes próprios e autorização explícita para backend.
