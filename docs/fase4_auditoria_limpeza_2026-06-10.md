# Fase 4 - Auditoria e Limpeza de Credenciais

Data: 2026-06-10

## Alteracoes

- Relatorio `lista_acessos` deixou de exibir/exportar senha.
- Cadastro de segurancas nao preenche mais senha existente ao editar.
- Edicao de seguranca com senha em branco preserva a credencial atual.
- Alteracao de senha registra evento em `auditoria`.
- Criacao/alteracao de seguranca registra evento em `auditoria`.

## Eventos de Auditoria

- `ALTERACAO_SENHA`
- `CRIACAO_SEGURANCA`
- `ALTERACAO_SEGURANCA`
- `TESTE_REGRAS`

## Observacao Atualizada

O campo legado `Sen_Segura` foi removido da colecao `segurancas` na Fase 6, depois da validacao de login Firebase Auth de todos os usuarios ativos.
