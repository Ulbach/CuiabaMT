# Decisoes

## Sem Cloud Functions

Decisao: nao usar Cloud Functions por custo.

Impacto: reset administrativo real de senha Auth existente deve ser feito pelo Firebase Console ou script local autorizado.

## Firestore Principal

Decisao: Firestore substitui Google Sheets como banco principal.

## Sem Senha Legivel

Decisao: nao manter `Sen_Segura` no banco.

## Compatibilidade de Sessao

Decisao: manter `delta_auth_firebase_v1` e compatibilidade com `delta_auth_v1`.

## Cache No-Store

Decisao: usar headers `no-store` no Hosting para reduzir versoes antigas em aparelhos.

## Troca de Motorista no Retorno

Decisao observada no codigo: entrada permite motorista de retorno diferente do motorista da saida.
