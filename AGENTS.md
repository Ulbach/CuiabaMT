# AGENTS.md - Instrucoes Permanentes para IAs

Este arquivo e obrigatorio para qualquer sessao de IA que assumir o projeto CUIABAMT.

## Antes de Qualquer Acao

1. Leia este arquivo.
2. Leia `README.md`.
3. Leia toda a pasta `docs/`.
4. Confirme que o projeto correto e:

```text
C:\Users\fabricio.ulbach\OneDrive - DELTA ENERGIA\Documentos\GitHub\CuiabaMT
```

5. Considere a documentacao permanente como fonte oficial, mas valide no codigo quando houver duvida.

## Regras de Trabalho

- O app esta em producao: agir com cautela.
- Nunca alterar regras de negocio sem justificar.
- Nunca remover funcionalidades sem autorizacao explicita.
- Nunca renomear colecoes Firestore sem plano de migracao.
- Sempre preservar compatibilidade com dados existentes.
- Sempre validar sintaxe antes de publicar.
- Sempre documentar alteracoes importantes.
- Priorizar estabilidade, simplicidade e performance.
- Nao alterar layout sem solicitacao explicita.
- Quando houver duvida, escrever `A confirmar`.
- Nao usar Cloud Functions neste projeto sem nova autorizacao explicita.
- Nao gravar senhas em texto legivel no Firestore.
- Nao executar reparos em usuarios reais sem confirmacao explicita do responsavel.

## Publicacao

- Frontend: `firebase deploy --only hosting:cuiabamt --project cuiaba-01617931-f126e`.
- Regras Firestore: publicar somente se `firestore.rules` for alterado e validado.
- Nao fazer deploy quando o pedido for apenas analise ou documentacao.

## Testes Minimos Recomendados

- `npm run build`
- `node scripts/verify-security-rules.mjs`
- `node scripts/verify-no-legacy-password-field.mjs`
- Testes manuais no navegador para as telas afetadas.
