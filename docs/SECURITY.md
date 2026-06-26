# Seguranca

## Modelo

Firebase Auth autentica. Firestore Rules autorizam com base em `usuarios_auth/{uid}`.

## Perfis

- `CONSULTA`: leitura.
- `OPERADOR`: operacao.
- `ADMIN`: administracao e relatorios.
- `SuperAdmin`: criacao/exclusao em colecoes sensiveis.

## Protecoes

- Nao gravar senha legivel.
- `MustChangePassword` controla troca obrigatoria.
- Contas `Protegido`, `CredencialPrivada` ou `SuperAdmin` exigem cautela.
- Telas aguardam Firebase Auth antes de consultar/gravar Firestore.
- `logs_acesso` registra login/logout.
- `auditoria` registra acoes administrativas/operacionais.

## Riscos

- Sem Cloud Functions, reset administrativo de senha Auth existente nao ocorre pelo frontend.
- Usuario Auth sem `usuarios_auth/{uid}` falha nas regras.
- Scripts locais alteram dados reais e exigem confirmacao explicita.
