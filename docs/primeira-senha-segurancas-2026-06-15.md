# Primeira senha de seguranças - 2026-06-15

## Objetivo

Corrigir e proteger o fluxo de primeiro acesso dos seguranças no projeto CuiabaMT em produção.

O problema investigado foi a possibilidade de um usuário ser criado no Firebase Authentication sem que todos os documentos correspondentes fossem gravados no Firestore. Esse cenário deixa a conta sem perfil completo em `usuarios_auth`/`segurancas` e pode impedir o login ou a troca obrigatória da primeira senha.

## Correções aplicadas

- `public/cad_segurancas.html`
  - A criação de usuário no Firebase Auth agora retorna `uid` e `idToken`.
  - Se a gravação no Firestore falhar após criar o Auth, o sistema tenta desfazer automaticamente a conta Auth recém-criada.
  - No cadastro novo, se `segurancas` ou `usuarios_auth` falhar, os documentos parciais são removidos e o Auth temporário é apagado.
  - Na edição de segurança antigo sem `AuthUid`, se o vínculo Firestore falhar, o perfil parcial e o Auth recém-criado são removidos.

- `scripts/create-auth-user.mjs`
  - O script manual de criação passou a ter rollback equivalente ao da tela.
  - Se uma etapa Firestore falhar, remove `usuarios_auth`, `segurancas` e o Auth recém-criado quando possível.

- Novos scripts operacionais:
  - `npm run auth:diagnose-security`
  - `npm run auth:repair-security`
  - `npm run test:first-password`

## Uso seguro em produção

Diagnóstico é somente leitura:

```powershell
$env:SECURITY_EMAIL='usuario@cuiabamt.local'
npm run auth:diagnose-security
Remove-Item Env:SECURITY_EMAIL
```

Reparo altera dados reais. Use somente depois de confirmação explícita do usuário responsável:

```powershell
$env:SECURITY_EMAIL='usuario@cuiabamt.local'
$env:SECURITY_PASSWORD='123456'
$env:DRY_RUN='1'
npm run auth:repair-security
```

Para aplicar de fato, trocar `DRY_RUN` para `0`.

Observação importante: se o e-mail já existe no Firebase Auth mas não há documento Firestore com o `uid`, o script tenta autenticar com `SECURITY_PASSWORD` para recuperar o `uid` e refazer o vínculo. Se essa senha não autenticar, será necessário redefinir a senha no Firebase Console ou usar Admin SDK antes de reparar o vínculo.

## Testes executados

```powershell
npm run build
node --check scripts/diagnose-security-auth.mjs
node --check scripts/repair-security-auth-profile.mjs
node --check scripts/test-first-password-flow.mjs
node --check scripts/create-auth-user.mjs
npm run test:first-password
node scripts/verify-security-rules.mjs
node scripts/verify-all-auth-logins.mjs
```

Resultados:

- Build de produção: OK.
- Sintaxe dos scripts novos e ajustados: OK.
- Teste real de primeira senha com usuário temporário `codex-teste-*`: OK.
- O teste temporário criou Auth + Firestore, validou `MustChangePassword=true`, trocou a senha, logou com a nova senha e removeu os dados de teste.
- Regras Firestore: OK. O `permission-denied` exibido no log faz parte do teste esperado de bloqueio para perfil `CONSULTA`.
- Verificação geral de logins Auth encontrou um usuário com senha legada divergente no backup local. Esse resultado não foi reparado automaticamente por segurança, pois o app está em produção e usuários reais podem já ter trocado suas senhas.

## Regra operacional

Não executar reparo em usuários reais sem confirmação explícita. Para contas em uso, priorizar diagnóstico somente leitura e validar com o operador antes de qualquer redefinição ou alteração.
