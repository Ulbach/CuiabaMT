# Roadmap Pos-Seguranca

Data: 2026-06-10

## Estado Atual

A seguranca critica foi resolvida: Firebase Auth esta ativo, Firestore esta fechado por regras, usuarios foram migrados e o campo legado de senha foi removido do banco.

## Fase 7 - Gestao Segura de Usuarios

Objetivo:

- Criar uma tela administrativa para criar, ativar, inativar e alterar perfil de usuarios sem manipular senha legivel no Firestore.

Escopo:

- Criar fluxo de novo usuario Firebase Auth.
- Gravar perfil em `usuarios_auth/{uid}`.
- Vincular `segurancas.AuthUid`.
- Permitir redefinicao de senha segura, preferencialmente via e-mail ou acao controlada de SuperAdmin.
- Exibir status Auth/perfil sem mostrar senha.

Criterios de aceite:

- SuperAdmin cria usuario novo.
- Usuario novo consegue login.
- ADMIN comum nao altera SuperAdmin.
- Nenhuma senha aparece em tela, CSV ou Firestore.

## Fase 8 - Auditoria Completa

Objetivo:

- Registrar alteracoes sensiveis fora do modulo de usuarios.

Escopo:

- Auditar veiculos.
- Auditar motoristas.
- Auditar responsaveis.
- Auditar entrada e saida de veiculos.
- Auditar alteracoes em visitantes, se o modulo continuar ativo.

Criterios de aceite:

- Cada gravacao sensivel gera documento em `auditoria`.
- Auditoria registra usuario, perfil, origem, colecao, alvo e data.
- SuperAdmin/ADMIN conseguem consultar auditoria.

## Fase 9 - Limpeza de Telas Legadas

Objetivo:

- Remover ou esconder telas antigas que possam confundir operacao.

Escopo:

- Revisar `cad_veiculos.html` combinado antigo.
- Revisar `setup.html` e `init_db.html`.
- Remover links para fluxos obsoletos.
- Garantir que apenas telas oficiais estejam acessiveis pelo menu.

Criterios de aceite:

- Nenhuma tela ativa tenta cadastrar senha.
- Nenhuma tela ativa usa fluxo legado de login.
- Menu aponta apenas para fluxos atuais.

## Fase 10 - Rotina de Backup

Objetivo:

- Transformar o backup manual em procedimento operacional.

Escopo:

- Definir periodicidade.
- Documentar responsavel.
- Padronizar nome e local do backup.
- Criar checklist antes de deploys grandes.

Criterios de aceite:

- Backup executado antes de mudancas criticas.
- Manifesto sanitizado atualizado.
- Dados brutos continuam fora do Git.

## Fase 11 - Testes Operacionais por Perfil

Objetivo:

- Validar o uso real do app com cada perfil.

Escopo:

- SuperAdmin.
- ADMIN.
- OPERADOR.
- CONSULTA.
- Entrada e saida de veiculo.
- Relatorios principais.
- Bloqueios de permissao.

Criterios de aceite:

- Cada perfil executa apenas o que deve.
- Tentativas indevidas sao negadas.
- Nao ha erros de permissao nas operacoes permitidas.

## Ordem Recomendada

1. Fase 7 - Gestao segura de usuarios.
2. Fase 8 - Auditoria completa.
3. Fase 9 - Limpeza de telas legadas.
4. Fase 10 - Rotina de backup.
5. Fase 11 - Testes operacionais por perfil.
