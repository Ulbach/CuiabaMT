# Funcoes JavaScript

## Autenticacao

`public/index.html` concentra login, sessao local, troca de senha, criacao de logs e montagem do menu.

Funcoes importantes: `getAuth`, `setAuth`, `clearAuth`, `aplicarLogoutForcadoPorUrl`, `buscarPerfilAuth`, `montarSessaoAuth`, `registrarLogin`, `registrarLogout`, `openAlterarSenha`, `closeAlterarSenha`, `montarMenu`, `openMenu`.

## Helpers Repetidos

Varias telas usam padroes repetidos:

- `aguardarFirebaseAuth`;
- `garantirFirebaseAuth`;
- `sessaoValidaLocal`;
- `aplicarPerfilConsulta`;
- `registrarAuditoria`;
- `existeRegistro`;
- `buscarExato`;
- `buscarPrefixo`.

## Operacao

- `saida.html`: carrega veiculos/motoristas, filtra restritos, grava saida e atualiza veiculo.
- `entrada.html`: busca movimentacao aberta, valida KM, registra retorno e atualiza veiculo.
- `Entrada_visitante.html`: registra entrada e bloqueia CPF em aberto.
- `Saida_visitante.html`: finaliza visita e calcula permanencia.

## Scripts

- `diagnose-security-auth.mjs`: diagnostico Auth/Firestore.
- `repair-security-auth-profile.mjs`: reparo de vinculo Auth/perfil.
- `test-first-password-flow.mjs`: teste de primeira senha.
- `create-auth-user.mjs`: criacao controlada de usuario.
- `firestore-backup.mjs`: backup.
- `verify-security-rules.mjs`: validacao de regras.
- `verify-no-legacy-password-field.mjs`: verifica ausencia de `Sen_Segura`.
