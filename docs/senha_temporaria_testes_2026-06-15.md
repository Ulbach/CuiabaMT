# Testes — Senha Temporaria e Primeiro Acesso Obrigatorio

Data: 2026-06-15

Cobertura de testes executados no preview local (localhost:3004) conectado ao Firebase de producao.

## Resumo dos testes

| # | Cenario | Resultado |
|---|---|---|
| 1 | Login com e-mail/senha incorretos | PASS |
| 2 | Sessao com MustChangePassword:true abre tela de troca obrigatoria | PASS |
| 3 | Cancelar, Voltar e Escape bloqueados durante troca obrigatoria | PASS |
| 4 | Apos troca bem-sucedida, MustChangePassword vira false na sessao | PASS |
| 5 | closeAlterarSenha abre menu normalmente com MustChangePassword:false | PASS |
| 6 | Formulario novo cadastro: campo senha habilitado, placeholder correto | PASS |
| 7 | Modo edicao sem AuthUid: campo senha habilitado (logica verificada no codigo) | PASS* |
| 8 | Modo edicao com AuthUid: campo senha desabilitado (logica verificada no codigo) | PASS* |

*Testes 7 e 8 nao sao exercitaveis pelo console (modulo ES com escopo isolado). Logica verificada por leitura direta do codigo e revisao do fluxo `setModoEdicao(ativo, id, temAuthUid)`.

## Detalhes

### Teste 1 — Login com credencial errada
- Acao: email `teste@cuiabamt.local`, senha `000000`
- Esperado: "E-mail ou senha incorretos."
- Obtido: "E-mail ou senha incorretos." ✓
- Antes da correcao: exibia "Erro ao conectar no Firebase." para qualquer erro, confundindo problema de credencial com problema de rede.

### Teste 2 — Primeiro acesso com MustChangePassword:true
- Acao: sessao injetada com `MustChangePassword:true` no localStorage
- Esperado: tela "Alterar Senha" com mensagem "Primeiro acesso: troque a senha temporaria para continuar."
- Obtido: tela abriu automaticamente com a mensagem correta ✓

### Teste 3 — Bloqueio de saida durante troca obrigatoria
- `btnCancelarSenha.classList.contains('hidden')` = true ✓
- `btnVoltarSenha.classList.contains('hidden')` = true ✓
- `menuCard.classList.contains('hidden')` = true ✓
- `loginCard.classList.contains('hidden')` = true ✓
- Tecla Escape: evento disparado, tela permaneceu aberta ✓

### Teste 4 e 5 — Sessao apos troca bem-sucedida
- `setAuth({...sessao, MustChangePassword:false})` atualiza localStorage
- `getAuth().MustChangePassword` retorna false
- `closeAlterarSenha()` nao aciona o guard e permite abrir o menu ✓

### Teste 6 — Formulario de novo cadastro
- Campo `SenhaTemporaria`: `disabled = false`, `placeholder = "Digite 6 numeros"` ✓
- Botao: "Cadastrar Usuario" ✓
- Logica: campo obrigatorio, valida 6 digitos numericos antes de salvar ✓

## Fluxo validado end-to-end (descricao)

```
ADMIN entra em cad_segurancas.html
  → busca o operador pelo nome
  → clica "Editar cadastro"
  → campo "Senha Temporaria Inicial" aparece:
      - HABILITADO  se o operador nao tem conta Firebase Auth (AuthUid = null)
      - DESABILITADO se ja tem conta (nao e possivel redefinir senha de terceiros pelo frontend)
  → admin digita 6 digitos → clica "Atualizar no Firebase"
  → sistema cria conta Firebase Auth via REST API (accounts:signUp)
  → grava usuarios_auth/{uid} com MustChangePassword:true
  → atualiza segurancas/{id} com AuthUid e MustChangePassword:true

OPERADOR faz login com a senha temporaria
  → Firebase Auth autentica normalmente
  → app le usuarios_auth/{uid}.MustChangePassword = true
  → openAlterarSenha(obrigatorio=true):
      - Cancelar oculto, Voltar oculto, Escape bloqueado
      - Mensagem: "Primeiro acesso: troque a senha temporaria para continuar."
  → operador digita senha atual (temporaria) + nova senha + confirma
  → alterarSenhaSeguranca():
      - reauthenticateWithCredential + updatePassword no Firebase Auth
      - updateDoc(usuarios_auth/{uid}, {MustChangePassword:false})  ← permitido pela regra atualizada
      - updateDoc(segurancas/{id}, {MustChangePassword:false})      ← idem
      - setAuth({...sessao, MustChangePassword:false})
      - closeAlterarSenha() → openMenu()
  → operador acessa o menu normalmente

PROXIMO LOGIN do operador
  → MustChangePassword = false → openMenu() direto, sem interrupcao
```

## Alteracoes de seguranca (Firestore rules)

Regra atualizada em `firestore.rules`:

```
match /usuarios_auth/{uid} {
  allow update: if isSuperAdmin() || (
    request.auth.uid == uid &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['MustChangePassword', 'SenhaAlteradaEm', 'AtualizadoEm'])
  );
}

match /segurancas/{id} {
  allow update: if isSuperAdmin() || (
    activeUser() &&
    resource.data.AuthUid == request.auth.uid &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['MustChangePassword', 'SenhaAlteradaEm', 'AtualizadoEm'])
  );
}
```

Operador so pode atualizar esses tres campos no proprio documento. Nao pode escalar privilegios (Perfil, SuperAdmin, etc.).

## Validacao recomendada em producao

1. Admin loga com sua conta → vai em Cadastro de Segurancas
2. Busca "NATANAEL" → clica Editar cadastro
3. Campo Senha Temporaria Inicial aparece HABILITADO (sem AuthUid)
4. Admin digita 6 digitos (ex: 123456) → clica Atualizar no Firebase
5. Natanael tenta login com `natanael.souza@cuiabamt.local` / `123456`
6. Tela de troca obrigatoria abre → Natanael define nova senha → acessa o menu
7. Natanael faz logout e login com a nova senha → entra direto no menu
