# Estrutura de listas fixas + deploy manual

## Objetivo
Tirar da planilha a consulta constante de:
- veículos
- motoristas
- seguranças

e passar essas listas para arquivos do projeto.

## Arquivos principais
- `src/listas_veiculos.gs`
- `src/listas_motoristas.gs`
- `src/listas_segurancas.gs`
- `src/listas_service.gs`

## Como atualizar
1. Edite os arquivos de listas.
2. Faça commit/push no GitHub.
3. Vá em **Actions**.
4. Rode o workflow **Deploy Apps Script**.
5. O projeto será enviado ao Apps Script via `clasp push`.

## Segredos necessários no GitHub
Crie em **Settings > Secrets and variables > Actions**:
- `CLASP_ACCESS_TOKEN`
- `CLASP_REFRESH_TOKEN`

## Onde integrar no seu projeto
Use o conteúdo de `src/como_integrar_no_codigo_gs.gs.txt`
para trocar a leitura da aba de listas no seu `Código.gs`.

## Observação
Este pacote não substitui seu projeto inteiro.
Ele adiciona a camada de listas fixas e o deploy manual.
