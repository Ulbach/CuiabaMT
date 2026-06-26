# Regras Tecnicas

Fonte: `firestore.rules`.

## Funcoes

- `signedIn()`: exige `request.auth != null`.
- `userProfile()`: le `usuarios_auth/{request.auth.uid}`.
- `activeUser()`: exige Auth, perfil existente e `Ativo == true`.
- `perfil()`: retorna `Perfil`.
- `isSuperAdmin()`: `SuperAdmin == true`.
- `isAdmin()`: `ADMIN` ou SuperAdmin.
- `isOperador()`: `OPERADOR` ou ADMIN.
- `isConsulta()`: `CONSULTA`, OPERADOR ou ADMIN.

## Permissoes

- `usuarios_auth`: usuario le proprio perfil; ADMIN lista; SuperAdmin cria/exclui; usuario atualiza apenas campos de troca de senha.
- `segurancas`: ADMIN le/lista; SuperAdmin cria/exclui; proprio usuario atualiza apenas troca de senha.
- `veiculos`: CONSULTA le; ADMIN cria/exclui; OPERADOR atualiza.
- `motoristas`: CONSULTA le; ADMIN grava.
- `responsaveis`: CONSULTA le; ADMIN grava.
- `movimentacoes_frota`: CONSULTA le; OPERADOR cria/atualiza; ADMIN exclui.
- `visitantes`: CONSULTA le; OPERADOR cria/atualiza; ADMIN exclui.
- `logs_acesso`: ADMIN le; usuario ativo cria/atualiza; SuperAdmin exclui.
- `auditoria`: ADMIN le; usuario ativo cria; update/delete negados.
- fallback: tudo negado.
