# Bugs e Limitacoes

## Reset de Senha

Sem Cloud Functions/Admin SDK backend, o frontend nao redefine senha Auth existente. Ele pode marcar `MustChangePassword`, mas a senha real precisa ser definida no Firebase Console ou por script autorizado.

## Auth Sem Perfil

Usuario existente no Firebase Auth sem `usuarios_auth/{uid}` ou sem `segurancas.AuthUid` falha nas regras.

## Indices

Algumas consultas podem exigir indices compostos no Firestore. Lista completa: A confirmar.

## Codigo Legado

`src/` e colecoes `frota_*` parecem conter legado. Confirmar antes de remover.

## Encoding

Terminal pode exibir acentos com mojibake; validar no navegador/arquivo.
