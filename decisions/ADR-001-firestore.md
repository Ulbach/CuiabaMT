# ADR-001 - Firestore como banco principal

## Status

Aceita.

## Contexto

O projeto CUIABAMT nasceu da migracao de fluxos antigos baseados em Google Apps Script/Google Sheets para uma arquitetura mais estavel com Firebase.

## Decisao

Usar Cloud Firestore como banco principal do sistema, mantendo Firebase Hosting para publicacao e Firebase Authentication para login.

## Consequencias

- Regras Firestore passam a ser parte critica da seguranca.
- Colecoes nao devem ser renomeadas sem migracao.
- Relatorios consultam Firestore diretamente.
- Apps Script fica como legado ou apoio historico, nao como banco principal.
