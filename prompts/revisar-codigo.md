# Prompt - Revisar Codigo

Use este prompt para revisao de codigo.

## Tarefa

Fazer review com foco em bugs, risco operacional, seguranca, permissoes e testes.

## Regras

- Priorizar achados por severidade.
- Citar arquivo e linha quando possivel.
- Verificar impacto em producao.
- Verificar compatibilidade com Firestore e Auth.
- Verificar se `CONSULTA`, `OPERADOR`, `ADMIN` e `SuperAdmin` continuam corretos.
- Apontar testes faltantes.
- Nao misturar review com refatoracao ampla sem pedido.
