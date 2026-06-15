# Senha Temporaria e Primeiro Acesso Obrigatorio

Data: 2026-06-15

## Objetivo

Permitir que um ADMIN/SuperAdmin gere uma senha temporaria para um operador (novo cadastro ou esqueceu a senha), e que o operador seja obrigado a trocar essa senha no primeiro acesso.

## Fluxo completo

1. **ADMIN/SuperAdmin** abre `cad_segurancas.html`
   - Para novo cadastro: preenche Nome, E-mail, Perfil e **Senha temporaria inicial** (6 digitos) → clica "Cadastrar Usuario"
   - O sistema cria o usuario no Firebase Auth via REST API e grava `MustChangePassword: true` em `segurancas` e `usuarios_auth`
   - Para operador existente **sem conta Auth** (AuthUid = null): editar o cadastro, informar 6 digitos no campo Senha Temporaria → sistema cria a conta e grava `MustChangePassword: true`
   - Para operador existente **com conta Auth mas senha desconhecida**: editar o cadastro, informar 6 digitos → sistema grava `MustChangePassword: true` no Firestore e exibe instrucoes para o admin definir a senha no Firebase Console (ver secao "Limitacao do frontend" abaixo)

2. **Operador** faz login com a senha temporaria
   - O sistema detecta `MustChangePassword: true` no perfil (lido de `usuarios_auth/{uid}`)
   - Abre automaticamente a tela de troca de senha com mensagem "Primeiro acesso: troque a senha temporaria para continuar"
   - Botoes "Cancelar", "Voltar" e tecla Escape ficam desabilitados — o operador nao consegue sair sem trocar

3. **Operador** define a nova senha
   - Firebase Auth atualiza a senha
   - `MustChangePassword: false` e `SenhaAlteradaEm` gravados em `usuarios_auth/{uid}` e `segurancas/{id}`
   - Sessao local e atualizada com `MustChangePassword: false`
   - Operador e redirecionado ao menu normalmente

4. **Proximos acessos**: `MustChangePassword: false` → login normal, sem interrupcao

## Arquivos alterados

| Arquivo | O que mudou |
|---|---|
| `public/cad_segurancas.html` | Campo "Senha temporaria inicial", funcao `criarUsuarioAuth()` via REST API, botao "Exigir troca de senha", exibe "Trocar senha no proximo acesso" na consulta |
| `public/index.html` | `MustChangePassword` na sessao, `openAlterarSenha(obrigatorio)` bloqueia saida, `closeAlterarSenha()` guarda acesso, `alterarSenhaSeguranca()` grava `MustChangePassword: false` apos troca |
| `firestore.rules` | Separou `update` de `create/delete` em `usuarios_auth` e `segurancas` para permitir auto-atualizacao restrita |
| `scripts/create-auth-user.mjs` | Inclui `MustChangePassword: true` no novo usuario criado pelo script |

## Correcao critica nas Firestore rules

**Problema**: `alterarSenhaSeguranca()` tentava gravar `MustChangePassword: false` em `usuarios_auth/{uid}`, mas a regra anterior so permitia `update` para `isSuperAdmin()`. Para um OPERADOR comum, o update falhava com `permission-denied` mesmo apos a senha ser trocada no Auth — gerando loop infinito de "primeiro acesso".

**Correcao aplicada**:

```
// usuarios_auth
allow update: if isSuperAdmin() || (
  request.auth.uid == uid &&
  request.resource.data.diff(resource.data).affectedKeys()
    .hasOnly(['MustChangePassword', 'SenhaAlteradaEm', 'AtualizadoEm'])
);

// segurancas
allow update: if isSuperAdmin() || (
  activeUser() &&
  resource.data.AuthUid == request.auth.uid &&
  request.resource.data.diff(resource.data).affectedKeys()
    .hasOnly(['MustChangePassword', 'SenhaAlteradaEm', 'AtualizadoEm'])
);
```

A restricao `affectedKeys().hasOnly(...)` garante que o operador so consegue atualizar os campos de senha — nao pode escalar privilegios (Perfil, SuperAdmin, etc.).

## Testes realizados

- Build `npm run build`: aprovado
- Simulacao de regras Firestore (10 cenarios): todos passaram
  - Operador atualiza proprio `MustChangePassword`: PERMITIDO
  - Operador tenta alterar `Perfil` no proprio doc: BLOQUEADO
  - Operador tenta alterar doc de outro usuario: BLOQUEADO
  - SuperAdmin altera qualquer campo de qualquer usuario: PERMITIDO
  - Usuario inativo nao pode atualizar: BLOQUEADO
- Simulacao do fluxo completo de primeiro acesso: todos os passos corretos

## Limitacao do frontend — redefinir senha de conta Auth existente

O Firebase Auth REST API nao permite alterar a senha de outro usuario sem Admin SDK (biblioteca servidor). O campo "Senha Temporaria Inicial" na tela de edicao, quando o usuario ja tem `AuthUid`, executa o seguinte:

1. Grava `MustChangePassword: true` em `segurancas/{id}` e `usuarios_auth/{uid}`
2. Exibe instrucoes para o admin ir ao Firebase Console e definir a senha manualmente:
   - https://console.firebase.google.com/project/cuiaba-01617931-f126e/authentication/users
   - Encontrar o e-mail do operador → 3 pontos → Editar usuario → definir nova senha
3. Admin informa a nova senha ao operador
4. Operador faz login → sistema forca troca (MustChangePassword: true)

## Validacao recomendada em producao

1. ADMIN cria novo operador com senha temporaria → verificar que `MustChangePassword: true` aparece na consulta
2. Operador faz login com senha temporaria → deve abrir tela de troca obrigatoria (sem botao Cancelar)
3. Operador troca a senha → deve ir para o menu normalmente
4. Operador faz logout e login com a nova senha → deve entrar direto no menu (sem tela de troca)
5. ADMIN edita operador com AuthUid existente → digita nova senha → sistema exibe aviso com instrucoes Firebase Console
