# Regras de Negocio

## Acesso

- `ADMIN`: cadastros, relatorios e administracao.
- `OPERADOR`: operacao de frota/visitantes.
- `CONSULTA`: leitura sem gravacao.
- `SuperAdmin`: permissao elevada nas regras.

## Login e Senha

- Login usa Firebase Auth por e-mail/senha.
- Sessao local dura ate 8 horas.
- `MustChangePassword=true` obriga troca de senha.
- Senha deve ter 6 digitos numericos.
- Nao gravar senha legivel no Firestore.
- Sem Cloud Functions: reset administrativo real de senha existente deve ser feito pelo Firebase Console ou script autorizado.

## Frota

- Veiculo ativo aparece nos fluxos.
- `EmTransito=true` impede nova saida.
- Veiculo `Restrito=true` exige motorista `AcessoRestrito=true`.
- Aviso de troca de oleo e informativo, nao bloqueia operacao.
- KM de saida nao pode ser menor que ultimo KM.
- KM de retorno nao pode ser menor que KM de saida.
- Entrada permite registrar motorista de retorno diferente.

## Visitantes

- Entrada exige nome e responsavel.
- CPF com visita em aberto nao pode abrir nova entrada.
- Saida finaliza visita e calcula permanencia.

## Cadastros

- Perfil CONSULTA nao deve incluir/editar.
- Duplicidade de CNH, placa, e-mail e nome de responsavel e bloqueada conforme tela.
- Acoes importantes registram `auditoria`.
