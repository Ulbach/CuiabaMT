# Banco de Dados

Banco principal: Cloud Firestore no projeto `cuiaba-01617931-f126e`.

## Colecoes Ativas

- `usuarios_auth`
- `segurancas`
- `veiculos`
- `motoristas`
- `responsaveis`
- `movimentacoes_frota`
- `visitantes`
- `logs_acesso`
- `auditoria`

## Colecoes Legadas/Compatibilidade

- `frota_veiculos`
- `frota_motoristas`

Uso atual dessas colecoes: A confirmar.

## Relacionamentos

- `usuarios_auth/{uid}` usa o UID do Firebase Auth.
- `segurancas.AuthUid` aponta para `usuarios_auth/{uid}`.
- `movimentacoes_frota.veiculoId` aponta para `veiculos/{id}`.
- `movimentacoes_frota.motoristaId` aponta para `motoristas/{id}`.
- `visitantes.responsavel` guarda texto; `responsaveis` e cadastro auxiliar.

## Consultas/Indices

Campos usados em filtros/ordenacoes incluem `Ativo`, `NomeBusca`, `Email`, `CNH`, `Placa`, `status`, `dataEntrada`, `dataSaida` e `loginEm`. Indices compostos exigidos pelo Firestore: A confirmar.
