# Guia de Release

## Antes de Publicar

1. Confirmar escopo da mudanca.
2. Conferir `git status --short`.
3. Rodar testes de `TESTING.md`.
4. Confirmar se a mudanca envolve somente frontend ou tambem regras Firestore.
5. Conferir que o app esta em producao e que nao ha reparos pendentes em usuarios reais.

## Publicar Frontend

```powershell
firebase deploy --only hosting:cuiabamt --project cuiaba-01617931-f126e
```

## Publicar Regras Firestore

Somente quando `firestore.rules` for alterado:

```powershell
firebase deploy --only firestore:rules --project cuiaba-01617931-f126e
```

## Pos-Publicacao

- Abrir `https://cuiabamt.web.app/index.html`.
- Testar login.
- Testar a tela alterada.
- Se houver problema de cache em aparelho, usar:

```text
https://cuiabamt.web.app/index.html?logout=1
```

## GitHub

Depois de validar:

```powershell
git add <arquivos>
git commit -m "Mensagem objetiva"
git push origin main
```

## Observacao

Nao publicar Firebase quando a tarefa for apenas documentacao, analise ou planejamento.
