# Fase 7 - Gestao Segura de Usuarios

Data: 2026-06-11

## Decisao Tecnica

A criacao de usuario nao deve ser feita diretamente pela tela web sem backend Admin SDK. O client Firebase consegue criar Auth user, mas nao consegue fazer isso com seguranca administrativa sem expor fluxo sensivel no navegador.

Por isso, o fluxo adotado foi:

- criar usuario Firebase Auth por script local controlado;
- gravar perfil em `usuarios_auth/{uid}`;
- criar/atualizar vinculo em `segurancas.AuthUid`;
- nao gravar senha legivel no Firestore;
- manter a tela `cad_segurancas.html` apenas para manutencao de perfil/status de usuarios existentes.

## Script

Arquivo: `scripts/create-auth-user.mjs`

Variaveis obrigatorias:

- `NEW_USER_EMAIL`
- `NEW_USER_PASSWORD` com 6 digitos numericos
- `NEW_USER_NAME`
- `NEW_USER_PROFILE` com `ADMIN`, `OPERADOR` ou `CONSULTA`

Modo de validacao sem criar usuario:

```powershell
$env:DRY_RUN='1'
$env:NEW_USER_EMAIL='teste.usuario@cuiabamt.local'
$env:NEW_USER_PASSWORD='123456'
$env:NEW_USER_NAME='TESTE USUARIO'
$env:NEW_USER_PROFILE='CONSULTA'
node scripts/create-auth-user.mjs
```

## Tela

`public/cad_segurancas.html`:

- bloqueia criacao direta;
- permite editar usuario existente somente para SuperAdmin;
- permite inativar usuario;
- atualiza `segurancas` e `usuarios_auth/{uid}` na mesma operacao;
- registra auditoria em `auditoria`.

## Testes

- Dry-run do script executado com sucesso.
- Regras Firestore validadas.
- Campo legado `Sen_Segura` ausente no banco atual.
- Logins Auth dos 9 usuarios ativos validados com sucesso.
