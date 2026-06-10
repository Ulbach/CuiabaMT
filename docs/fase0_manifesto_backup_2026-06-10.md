# Fase 0 - Manifesto Sanitizado do Backup

Data: 2026-06-10

## Backup

- Local: `backups/firestore-2026-06-10T18-15-02-487Z`
- Status: criado localmente
- Git: ignorado por `.gitignore`
- Observacao: os arquivos brutos podem conter dados sensiveis e nao devem ser commitados.

## Resumo Por Colecao

| Colecao | Documentos | Campos sensiveis detectados |
|---|---:|---|
| `segurancas` | 9 | `CredencialPrivada`, `Sen_Segura` |
| `veiculos` | 4 | nenhum |
| `motoristas` | 13 | nenhum |
| `responsaveis` | 2 | nenhum |
| `movimentacoes_frota` | 5 | nenhum |
| `logs_acesso` | 85 | nenhum |
| `visitantes` | 2 | nenhum |
| `frota_veiculos` | 0 | nenhum |
| `frota_motoristas` | 0 | nenhum |

## Achados

- A colecao `segurancas` ainda contem credenciais em `Sen_Segura`.
- A conta administrativa principal esta marcada como protegida no banco.
- `logs_acesso` contem campos com espaco final, como `nome ` e `status `, que devem ser normalizados em fase futura.
- As colecoes legadas `frota_veiculos` e `frota_motoristas` estao vazias.

## Proxima Acao Recomendada

Iniciar Fase 1 com Firebase Auth em paralelo, mantendo a producao funcional e sem remover ainda os campos antigos.
