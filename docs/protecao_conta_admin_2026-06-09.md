# Protecao da Conta Administrativa

Data: 2026-06-09

## Objetivo

Proteger a conta administrativa principal do CuiabaMT para reduzir exposicao da credencial e impedir alteracao de senha pela interface por outro usuario ADMIN.

## Alteracoes aplicadas

- Documento da conta administrativa marcado no Firestore com:
  - `Protegido: true`
  - `SuperAdmin: true`
  - `CredencialPrivada: true`
  - `BloquearAlteracaoPorOutroAdmin: true`
  - `EmailVisivelSomenteDono: true`
- Tela de alteracao de senha bloqueia troca da senha de conta protegida quando a sessao atual nao pertence a propria conta.
- Cadastro de segurancas bloqueia edicao de conta protegida por outro usuario.
- Relatorio de segurancas mascara o e-mail de contas protegidas.

## Observacao tecnica

A protecao acima e uma barreira de aplicacao. Para protecao forte no banco, o projeto precisa migrar o login para Firebase Auth ou backend equivalente e fechar as regras do Firestore. As regras atuais ainda permitem leitura/escrita direta durante a fase de testes, entao nao devem ser tratadas como controle definitivo de seguranca.
