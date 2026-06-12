# Ajuste do Campo de Troca de Oleo no Cadastro de Veiculos

Data: 2026-06-12

## Problema

Na tela `public/cad_veiculos.html`:

1. A regra dos 5.000 km era bloqueante: se o KM informado para a troca de oleo passasse de 5.000 km a frente do KM atual, o sistema exibia erro e impedia a gravacao. A intencao operacional era apenas uma observacao, nao um bloqueio.
2. O rotulo `KM Ultima Troca Oleo` estava semanticamente errado. O sistema inteiro trata o campo `KmTrocaOleo` como o KM previsto para a PROXIMA troca: `entrada.html`, `saida.html` e a propria consulta de veiculos calculam `KmTrocaOleo - KmAtual` e avisam "faltam X km para a troca de oleo".

## Alteracoes

Arquivo alterado: `public/cad_veiculos.html` (nenhum outro arquivo do app foi modificado).

1. A validacao dos 5.000 km em `salvarVeiculo()` deixou de bloquear. Agora exibe aviso nao bloqueante e segue gravando:
   - Antes: `msg(..., "erro"); return;`
   - Depois: `msg("Observação: KM da próxima troca está mais de 5.000 km à frente do KM atual. Confira o valor.", "warn")` sem `return`.
2. Rotulo do campo: `KM Última Troca Óleo *` passou para `KM da Próxima Troca *`.
3. Texto de apoio do campo: `KM previsto para a próxima troca de óleo. Apenas observação, não bloqueia a gravação.`
4. Placeholder: `Ex: 900` passou para `Ex: 6000`.
5. Resultado da consulta: `KM Troca Óleo:` passou para `KM Próxima Troca:`.

## O que NAO mudou

- O campo no Firestore continua sendo `KmTrocaOleo`. Nenhuma migracao de dados foi necessaria.
- Campos obrigatorios, bloqueio de placa duplicada, auditoria (`CRIACAO_VEICULO` / `ALTERACAO_VEICULO`) e bloqueio do perfil CONSULTA permanecem identicos.
- Os avisos informativos de oleo em `entrada.html`, `saida.html` e na consulta continuam nao bloqueantes, como ja eram.

## Testes Executados

- `npm run build` aprovado.
- Teste local em servidor estatico (porta 3004) com sessao local simulada:
  - Rotulo, texto de apoio e placeholder novos renderizados corretamente.
  - KM da proxima troca 6.001 km a frente do KM atual: aviso `warn` exibido e fluxo seguiu para a gravacao (sem bloqueio).
  - KM da proxima troca abaixo do KM atual (cenario de cadastro inicial da frota): nenhum aviso, fluxo seguiu direto para a gravacao.
  - Console sem erros de JavaScript; apenas `permission-denied` do Firestore, esperado sem Firebase Auth real e confirmando as regras de seguranca ativas.

## Publicacao

- `firebase deploy --only hosting:cuiabamt` executado em 2026-06-12 com sucesso.
- URL: `https://cuiabamt.web.app`

## Validacao recomendada em producao

1. Cadastrar veiculo com KM da proxima troca abaixo do KM atual: deve gravar sem aviso.
2. Cadastrar veiculo com KM da proxima troca mais de 5.000 km a frente: deve exibir a observacao e gravar mesmo assim.
