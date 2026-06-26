# Guia de Testes

## Testes Basicos

```powershell
npm run build
node scripts/verify-security-rules.mjs
node scripts/verify-no-legacy-password-field.mjs
```

## Quando Alterar Login/Senha

Executar, quando aplicavel:

```powershell
node --check scripts/diagnose-security-auth.mjs
node --check scripts/repair-security-auth-profile.mjs
node --check scripts/test-first-password-flow.mjs
npm run test:first-password
```

Nao executar reparos em usuario real sem confirmacao explicita.

## Teste Manual Minimo

- Login com perfil ADMIN.
- Login com perfil OPERADOR.
- Login com perfil CONSULTA, verificando bloqueio de gravacao.
- Saida de veiculo normal.
- Entrada de veiculo em transito.
- Entrada e saida de visitante.
- Abertura da central de relatorios.
- Logout com atualizacao de `logs_acesso`.

## Teste Visual

Para mudancas de UI:

- conferir desktop e mobile;
- conferir textos com acentos;
- conferir botoes de voltar/sair;
- conferir que textos nao sobrepoem campos;
- conferir que tabelas em relatorios rolam horizontalmente.

## Regras Firestore

Se `firestore.rules` mudar:

```powershell
node scripts/verify-security-rules.mjs
```

O `permission-denied` esperado para casos negativos nao deve ser tratado como falha se o script indicar sucesso.
