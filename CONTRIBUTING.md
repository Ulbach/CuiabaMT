# Contribuindo no CUIABAMT

## Antes de Alterar

1. Confirme que esta no projeto correto:

```text
C:\Users\fabricio.ulbach\OneDrive - DELTA ENERGIA\Documentos\GitHub\CuiabaMT
```

2. Leia `AGENTS.md`, `README.md`, `docs/` e `decisions/`.
3. Verifique `git status --short`.
4. Entenda o fluxo afetado antes de editar.

## Regras

- O app esta em producao.
- Nao alterar Firebase, regras ou deploy sem pedido explicito.
- Nao remover funcionalidades existentes sem autorizacao.
- Nao renomear colecoes/campos Firestore sem plano de migracao.
- Nao gravar senha legivel no Firestore.
- Manter compatibilidade com dados existentes.
- Preferir mudancas pequenas e rastreaveis.

## Padrao de Mudanca

- Codigo: alterar somente arquivos necessarios.
- Documentacao: atualizar `docs/` quando a regra, fluxo ou operacao mudar.
- Decisoes permanentes: registrar ADR em `decisions/`.
- Testes: seguir `TESTING.md`.
- Publicacao: seguir `RELEASE.md`.

## Commits

Mensagens devem explicar o objetivo:

```text
Corrige login de seguranca sem perfil Auth
Adiciona relatorio de pendencias de acesso
Documenta decisoes de relatorios
```
