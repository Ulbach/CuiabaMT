# Fase 3 - Publicacao Controlada

Data: 2026-06-10

## Sequencia Executada

1. Build do app aprovado.
2. Hosting publicado com login Firebase Auth em paralelo.
3. Login SuperAdmin/ADMIN validado no navegador.
4. Regras Firestore compiladas em dry-run.
5. Regras Firestore publicadas.
6. Relatorio de segurancas e tela de veiculos validados com regras fechadas.
7. Script de verificacao por perfil executado.

## Validacoes Esperadas

- Anonimo nao le colecao operacional.
- ADMIN le `segurancas`.
- CONSULTA le `veiculos`.
- CONSULTA nao cria `motoristas`.
- OPERADOR cria registro de `auditoria`.

## Rollback

Se alguma validacao critica falhar:

- reverter Hosting para versao anterior no console Firebase;
- reaplicar temporariamente a regra antiga aberta a partir do historico Git somente para restaurar operacao;
- corrigir o app e publicar novamente antes de fechar as regras.
