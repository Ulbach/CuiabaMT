# Plano de Seguranca em Fases

Data: 2026-06-10

## Objetivo

Evoluir o CuiabaMT em producao para autenticacao real, regras Firestore fechadas e auditoria, sem interromper o uso atual do app.

## Regra operacional

Cada fase deve terminar com:

- testes executados;
- documentacao atualizada;
- commit no Git;
- push para o branch de trabalho;
- rollback conhecido antes de qualquer publicacao sensivel.

## Fase 0 - Backup, Inventario e Rollback

Escopo:

- gerar backup local das colecoes criticas do Firestore;
- manter `backups/` fora do Git;
- registrar manifesto sanitizado, sem dados pessoais ou senhas;
- inventariar colecoes, telas e pontos que leem/gravam dados;
- registrar risco atual das regras Firestore.

Criterio de conclusao:

- backup local criado;
- manifesto revisado;
- build do app aprovado;
- nenhuma regra de producao alterada.

## Fase 1 - Autenticacao em Paralelo

Escopo:

- criar usuarios no Firebase Auth para os perfis atuais;
- manter compatibilidade temporaria com a colecao `segurancas`;
- criar mapeamento `uid -> perfil`;
- manter producao funcionando antes de fechar regras.

Criterio de conclusao:

- login Auth testado com SuperAdmin, ADMIN, OPERADOR e CONSULTA;
- login antigo ainda disponivel apenas como fallback temporario;
- nenhuma senha nova salva em texto puro.

## Fase 2 - Regras Firestore em Ensaio

Escopo:

- escrever regras por perfil;
- testar em emulador antes de publicar;
- separar permissoes de leitura e escrita por colecao.

Criterio de conclusao:

- testes de leitura/escrita passam por perfil;
- tentativas indevidas sao negadas;
- regras antigas preservadas para rollback.

## Fase 3 - Publicacao Controlada

Escopo:

- publicar app novo primeiro;
- validar login e operacoes em producao;
- publicar regras Firestore apenas depois da validacao do app.

Criterio de conclusao:

- SuperAdmin, ADMIN, OPERADOR e CONSULTA testados;
- entrada/saida de veiculos testada;
- relatorios principais testados;
- regras publicadas sem bloquear o uso esperado.

## Fase 4 - Auditoria e Protecoes Finas

Escopo:

- registrar quem alterou usuarios, veiculos, motoristas e responsaveis;
- registrar eventos de senha e permissoes;
- remover exposicao de senhas em telas e CSVs;
- manter conta SuperAdmin protegida.

Criterio de conclusao:

- log de auditoria visivel para SuperAdmin;
- CSVs nao exportam senhas;
- conta protegida nao pode ser alterada por outro admin.

## Fase 5 - Limpeza Final

Escopo:

- remover fallback inseguro;
- remover uso de `Sen_Segura` como credencial;
- atualizar documentacao final;
- validar app em producao.

Criterio de conclusao:

- Firestore fechado;
- app sem dependencia de senha em texto puro;
- documentacao e rollback final registrados.

## Rollback

Antes de cada fase:

- registrar commit inicial;
- registrar versao atual do Firebase Hosting;
- preservar `firestore.rules` atual;
- nao publicar regras restritivas antes do app compatibilidade estar validado.

Se houver falha:

- reverter Hosting para versao anterior;
- reaplicar temporariamente as regras anteriores;
- voltar ao commit anterior da fase.
