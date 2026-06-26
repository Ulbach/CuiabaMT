# Prompt - Criar Relatorio

Use este prompt quando precisar criar um novo relatorio no CUIABAMT.

## Tarefa

Criar um relatorio novo seguindo o padrao de `public/relatorios/`.

## Regras

- Ler `AGENTS.md`, `README.md`, `docs/REPORTS.md`, `docs/SECURITY.md` e `decisions/ADR-004-relatorios.md`.
- Confirmar colecoes e campos no codigo antes de implementar.
- Aguardar Firebase Auth antes de consultar Firestore.
- Respeitar perfis e regras Firestore.
- Incluir filtros, estado vazio, erro amigavel e exportacao CSV quando fizer sentido.
- Testar desktop/mobile e `npm run build`.
- Documentar o novo relatorio em `docs/REPORTS.md`.
