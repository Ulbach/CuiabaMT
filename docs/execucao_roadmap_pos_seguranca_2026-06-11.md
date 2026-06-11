# Execucao do Roadmap Pos-Seguranca

Data: 2026-06-11

## Resumo

Foram executadas as fases 7 a 11 do roadmap pos-seguranca com foco em manter CuiabaMT isolado, sem reaproveitar dados do DeltaBioMS e sem voltar a gravar senha legivel no Firestore.

## Fase 7 - Gestao Segura de Usuarios

- Criado `scripts/create-auth-user.mjs` para provisionar usuario Firebase Auth e criar os vinculos em `segurancas` e `usuarios_auth`.
- A tela `cad_segurancas.html` passou a ser manutencao de perfil/status de usuarios existentes.
- A criacao direta pela tela foi bloqueada para evitar cadastro sem Firebase Auth.
- Alteracoes em usuario existente sincronizam `segurancas` e `usuarios_auth/{uid}`.
- Somente SuperAdmin visualiza acao de edicao.
- O campo `Ativo` deixou de ser obrigatorio na tela, permitindo inativar usuario.

## Fase 8 - Auditoria Completa

Novos eventos auditados:

- `CRIACAO_MOTORISTA`
- `ALTERACAO_MOTORISTA`
- `CRIACAO_RESPONSAVEL`
- `ALTERACAO_RESPONSAVEL`
- `CRIACAO_VEICULO`
- `ALTERACAO_VEICULO`
- `REGISTRO_SAIDA`
- `REGISTRO_ENTRADA`
- `CRIACAO_USUARIO_AUTH`
- `ALTERACAO_SEGURANCA`

A auditoria grava usuario, perfil, origem, colecao alvo, ID alvo, detalhes e data. A auditoria e nao bloqueante para nao travar operacao caso o log falhe depois da gravacao principal.

## Fase 9 - Limpeza de Telas Legadas

- `setup.html` foi neutralizado e deixou de executar criacao antiga de usuarios.
- `init_db.html` foi neutralizado e deixou de inicializar colecoes antigas.
- `cad_veiculos.html` permanece ativo por ainda ser o cadastro oficial de frota, mas agora possui auditoria.
- Fluxos antigos que tentavam cadastrar senha foram removidos da operacao ativa.

## Fase 10 - Rotina de Backup

Procedimento recomendado antes de mudancas criticas:

1. Executar `node scripts/firestore-backup.mjs`.
2. Conferir manifesto sanitizado gerado.
3. Confirmar que `backups/` continua fora do Git.
4. Rodar testes locais.
5. Fazer deploy somente apos validacao.

## Fase 11 - Testes Operacionais por Perfil

Checklist operacional:

- SuperAdmin: editar perfil/status de usuarios existentes.
- ADMIN: usar cadastros permitidos sem alterar conta protegida.
- OPERADOR: registrar entrada e saida.
- CONSULTA: consultar sem gravar.
- Anonimo: nao acessar Firestore protegido.
- Relatorios: continuar sem expor senha real.

## Comandos de Validacao

- `node scripts/create-auth-user.mjs` com `DRY_RUN=1`
- `node scripts/verify-security-rules.mjs`
- `node scripts/verify-no-legacy-password-field.mjs`
- `node scripts/verify-all-auth-logins.mjs`
- `npm run build`

## Observacao Importante

O script de criacao de usuarios usa credencial SuperAdmin recuperada do backup local ignorado pelo Git. O backup contem dados sensiveis e nao deve ser publicado.
