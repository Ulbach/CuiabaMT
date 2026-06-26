# DELTA CUIABA - Controle de Frota

Sistema web de controle operacional da unidade Delta Cuiaba, com foco em frota, visitantes, agenda, cadastros administrativos, segurancas, auditoria de acesso e relatorios.

## Tecnologias

- HTML, CSS e JavaScript no frontend.
- Firebase Hosting para publicacao.
- Cloud Firestore como banco principal.
- Firebase Authentication para login por e-mail/senha.
- Firebase CLI para deploy manual.
- Vite configurado no projeto para build/validacao.

## Estrutura Principal

- `public/`: telas publicadas no Firebase Hosting.
- `public/relatorios/`: central e relatorios administrativos/operacionais.
- `public/css/`: estilos compartilhados.
- `public/js/`: modulos JavaScript auxiliares.
- `scripts/`: scripts locais de diagnostico, reparo, backup e validacao.
- `docs/`: documentacao permanente e historica.
- `firestore.rules`: regras de seguranca do Firestore.
- `firebase.json`: configuracao do Hosting e Firestore Rules.

## Funcionalidades

- Login de segurancas por Firebase Auth.
- Troca obrigatoria de senha temporaria no primeiro acesso.
- Menu principal com acesso por perfil.
- Controle de veiculos, saida, entrada e veiculos em transito.
- Controle de visitantes, entrada, saida e relatorio.
- Agenda local da unidade.
- Cadastros de motoristas, segurancas, responsaveis e veiculos.
- Relatorios de CNH, noturno, operacional, resumo, segurancas, acessos e logs.
- Auditoria em `auditoria` e `logs_acesso`.

## Como Executar Localmente

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 3003
```

Abrir:

```text
http://127.0.0.1:3003/index.html
```

## Como Validar

```powershell
npm run build
node scripts/verify-security-rules.mjs
node scripts/verify-no-legacy-password-field.mjs
```

Outros scripts existem para diagnostico de usuarios Auth e devem ser usados com cautela porque o app esta em producao.

## Como Publicar

Publicacao de frontend:

```powershell
firebase deploy --only hosting:cuiabamt --project cuiaba-01617931-f126e
```

Publicacao de regras somente quando `firestore.rules` for alterado e revisado:

```powershell
firebase deploy --only firestore:rules --project cuiaba-01617931-f126e
```

## Observacoes Importantes

- O app esta em producao.
- Nao usar Cloud Functions neste projeto, por decisao operacional de custo.
- Nao renomear colecoes Firestore sem plano de migracao.
- Nao gravar senha legivel no Firestore.
- Preservar compatibilidade com `delta_auth_firebase_v1` e, quando existente, `delta_auth_v1`.
