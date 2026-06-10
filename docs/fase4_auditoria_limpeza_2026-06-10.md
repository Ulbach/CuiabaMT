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

## Observacao

O campo legado `Sen_Segura` permanece temporariamente para compatibilidade e rollback. A remocao completa fica condicionada a todos os usuarios operarem somente via Firebase Auth.
