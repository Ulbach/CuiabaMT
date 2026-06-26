# ADR-002 - Login por Firebase Auth e perfil em usuarios_auth

## Status

Aceita.

## Contexto

O sistema precisa autenticar segurancas e aplicar permissoes por perfil sem gravar senhas legiveis no Firestore.

## Decisao

Usar Firebase Authentication para e-mail/senha e `usuarios_auth/{uid}` como perfil autorizado pelas regras Firestore.

## Consequencias

- `segurancas.AuthUid` deve apontar para o UID do Auth.
- Usuario Auth sem `usuarios_auth/{uid}` nao acessa Firestore.
- `MustChangePassword` controla troca obrigatoria.
- Reset administrativo real de senha Auth existente nao sera feito por Cloud Functions, por decisao de custo.
