# ADR-004 - Relatorios no frontend com Firestore

## Status

Aceita.

## Contexto

Relatorios precisam funcionar sem backend adicional e sem Cloud Functions.

## Decisao

Implementar relatorios como paginas HTML em `public/relatorios/`, consultando Firestore diretamente apos validar sessao e aguardar Firebase Auth.

## Consequencias

- Regras Firestore devem liberar leituras conforme perfil.
- Relatorios administrativos exigem ADMIN.
- Consultas devem considerar indices Firestore.
- Exportacoes CSV podem ser feitas no navegador.
