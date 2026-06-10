# Fase 6 - Limpeza da Senha Legada

Data: 2026-06-10

## Objetivo

Remover a dependencia do app no campo legado `Sen_Segura` e retirar esse campo dos documentos da colecao `segurancas`.

## Ordem Segura

1. Validar login Firebase Auth de todos os usuarios ativos.
2. Remover fallback legado do login.
3. Remover atualizacao de `Sen_Segura` na troca de senha.
4. Bloquear cadastro manual de senha no cadastro de segurancas.
5. Publicar Hosting.
6. Validar regras e login em producao.
7. Remover `Sen_Segura` do Firestore.

## Resultado Esperado

- App depende de Firebase Auth para login.
- Firestore nao armazena mais senha legivel em `segurancas`.
- Regras nao permitem atualizacao direta de senha legada.
- Backup local continua sendo o ponto de rollback, fora do Git.

## Resultado Executado

- `node scripts/verify-all-auth-logins.mjs`: 9 de 9 usuarios ativos validados via Firebase Auth.
- Hosting publicado sem fallback legado.
- Regras Firestore publicadas sem permissao especial para `Sen_Segura`.
- `node scripts/remove-legacy-password-field.mjs`: campo removido de 9 documentos.
- `node scripts/verify-no-legacy-password-field.mjs`: 0 documentos com `Sen_Segura`.
