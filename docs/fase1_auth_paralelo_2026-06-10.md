# Fase 1 - Firebase Auth em Paralelo

Data: 2026-06-10

## Objetivo

Criar autenticacao real por Firebase Auth sem interromper o uso atual do app em producao.

## Estrategia

- Manter a colecao `segurancas` como cadastro operacional temporario.
- Criar um usuario Firebase Auth para cada seguranca ativo com e-mail e senha numerica atual.
- Criar `usuarios_auth/{uid}` como perfil seguro para regras Firestore.
- Atualizar `segurancas.AuthUid` para rastrear o vinculo com o usuario Auth.
- Atualizar o login principal para preferir Firebase Auth.

## Resultado Esperado

- Login novo autentica via Firebase Auth.
- Perfil e permissoes sao carregados de `usuarios_auth/{uid}`.
- Senhas deixam de ser exibidas/exportadas nas telas ajustadas.
- Regras Firestore ainda nao sao fechadas nesta fase.

## Rollback

Se o login Auth falhar:

- manter temporariamente o fallback legado enquanto as regras ainda estao abertas;
- reverter Hosting para versao anterior;
- nao publicar regras restritivas ate o login novo estar validado.
