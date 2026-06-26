# Projeto CUIABAMT

Sistema web operacional da unidade Delta Cuiaba para controle de frota, visitantes, agenda, usuarios, cadastros e relatorios.

## Objetivo

Substituir o modelo antigo baseado em Google Apps Script/Google Sheets por uma aplicacao publicada no Firebase Hosting, com Cloud Firestore como banco principal e Firebase Authentication para login.

## Escopo

- Login de segurancas por e-mail e senha.
- Troca obrigatoria de senha temporaria.
- Menu principal por perfil.
- Saida e entrada de veiculos.
- Visitantes: entrada, saida e relatorio.
- Agenda local.
- Cadastros administrativos.
- Relatorios operacionais e administrativos.
- Auditoria de acoes e logs de acesso.

## Modulos

- Login/menu: `public/index.html`.
- Administracao: `public/admin.html`.
- Frota: `public/veiculos.html`, `public/saida.html`, `public/entrada.html`.
- Visitantes: `public/visitantes.html`, `public/Entrada_visitante.html`, `public/Saida_visitante.html`.
- Agenda: `public/agenda.html`.
- Cadastros: `public/cad_motoristas.html`, `public/cad_segurancas.html`, `public/cad_responsaveis.html`, `public/cad_veiculos.html`.
- Relatorios: `public/relatorios/*.html` e `public/relatorio_visitantes.html`.

## Publico-Alvo

Segurancas, operadores, administradores e usuarios de consulta autorizados.
