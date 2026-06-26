# Colecoes Firestore

## `usuarios_auth`

Perfil de autorizacao vinculado ao Firebase Auth.

Campos: `uid`, `segurancaId`, `Email`, `Nome`, `NomeBusca`, `Perfil`, `Ativo`, `Protegido`, `SuperAdmin`, `CredencialPrivada`, `MustChangePassword`, `CriadoPelaTela`, `SenhaAlteradaEm`, `AtualizadoEm`.

## `segurancas`

Cadastro operacional dos usuarios/segurancas.

Campos: `AuthUid`, `AuthMigrado`, `Email`, `Nome`, `NomeBusca`, `Perfil`, `Ativo`, `Protegido`, `SuperAdmin`, `CredencialPrivada`, `BloquearAlteracaoPorOutroAdmin`, `MustChangePassword`, `CriadoEm`, `AtualizadoEm`, `SenhaAlteradaEm`.

Nao gravar senha legivel. Campo legado `Sen_Segura` nao deve voltar.

## `veiculos`

Campos: `Nome`, `NomeBusca`, `Placa`, `Cor`, `CategoriaUso`, `Ativo`, `Restrito`, `EmTransito`, `KmAtualCadastro`, `KmTrocaOleo`, `DataTrocaOleo`, `MotoristaAtual`, `DestinoAtual`, `UltimaSaidaEm`, `UltimaEntradaEm`, `CriadoEm`, `AtualizadoEm`.

## `motoristas`

Campos: `Nome`, `NomeBusca`, `CNH`, `Val_CNH`, `CategoriasAutorizadas`, `AcessoRestrito`, `Ativo`, `CriadoEm`, `AtualizadoEm`.

## `responsaveis`

Campos: `nome`, `area`, `email`, `telefone`, `ativo`, `criadoEm`, `atualizadoEm`.

## `movimentacoes_frota`

Campos: `tipo`, `status`, `veiculoId`, `veiculo`, `Veiculo`, `placa`, `motoristaId`, `motorista`, `Motorista`, `motoristaRetorno`, `motoristaSaida`, `motoristaTrocaRetorno`, `segurancaSaida`, `SegurancaSaida`, `segurancaEntrada`, `SegurancaEntrada`, `KmSaida`, `kmSaida`, `KmRetorno`, `kmRetorno`, `destino`, `Destino`, `dataSaida`, `dataRetorno`, `criadoEm`, `atualizadoEm`, `origem`, `origemEntrada`.

## `visitantes`

Campos: `cpf`, `nome`, `telefone`, `responsavel`, `status`, `dataEntrada`, `dataSaida`, `dataReferencia`, `tempoPermanenciaMin`, `segurancaEntrada`, `perfilEntrada`, `segurancaSaida`, `perfilSaida`, `origem`, `origemSaida`, `criadoEm`, `atualizadoEm`.

## `logs_acesso`

Campos: `segurancaId`, `nome`, `email`, `perfil`, `loginEm`, `loginMs`, `logoutEm`, `logoutMs`, `tempoConectadoMin`, `status`, `origem`, `userAgent`, `criadoEm`, `atualizadoEm`.

## `auditoria`

Campos: `tipo`, `alvoColecao`, `alvoId`, `usuarioUid`, `usuarioNome`, `usuarioEmail`, `usuarioPerfil`, `origem`, `detalhes`, `criadoEm`.
