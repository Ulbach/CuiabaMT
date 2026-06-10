# Fase 2 - Regras Firestore por Perfil

Data: 2026-06-10

## Objetivo

Substituir a regra aberta por regras baseadas em Firebase Auth e no perfil `usuarios_auth/{uid}`.

## Perfis

- `SuperAdmin`: administra usuarios Auth/perfis e pode excluir dados sensiveis.
- `ADMIN`: administra cadastros operacionais e consulta relatorios.
- `OPERADOR`: registra operacoes de entrada/saida e consulta dados necessarios.
- `CONSULTA`: somente leitura operacional.

## Colecoes Protegidas

- `usuarios_auth`: leitura propria ou admin; escrita somente SuperAdmin.
- `segurancas`: leitura admin; escrita SuperAdmin; usuario pode atualizar somente sua propria senha legada temporaria.
- `veiculos`: leitura autenticada; escrita por operador/admin para operacao de frota.
- `motoristas`, `responsaveis`: escrita admin.
- `movimentacoes_frota`, `visitantes`: escrita operador/admin.
- `logs_acesso`: criacao/atualizacao por usuario autenticado; leitura admin.
- `auditoria`: criacao por usuario autenticado; leitura admin.

## Observacao

As regras dependem de todas as telas que usam Firestore inicializarem Firebase Auth. Essa preparacao foi aplicada antes da publicacao das regras.
