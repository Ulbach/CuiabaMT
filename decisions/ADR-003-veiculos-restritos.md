# ADR-003 - Veiculos restritos

## Status

Aceita.

## Contexto

Alguns veiculos exigem motorista autorizado para uso restrito.

## Decisao

Veiculo com `Restrito=true` so deve aparecer/ser liberado para motorista com `AcessoRestrito=true`.

## Consequencias

- A tela de saida filtra veiculos conforme o motorista.
- Motorista sem acesso restrito nao deve operar veiculo restrito.
- Relatorios devem preservar informacao de veiculo restrito quando disponivel.
