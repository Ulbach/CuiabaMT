/*******************************************************
 * FROTA PRO — BACKEND (Apps Script) — COMPLETO + JSONP
 * Rotas GET (sem CORS, via JSONP se "callback=" for enviado):
 *   ping, home, lists, listsAvail, kmAtual, statusVeiculo, bootstrap, diag
 *   saidaGet  (grava saída por GET — uso temporário)
 *   entradaGet(grava entrada por GET — uso temporário)
 * Rotas POST (para uso futuro com mesmo domínio/proxy):
 *   saida, entrada
 *******************************************************/

/************** CONFIG **************/
const SHEET_ID = '1InNx25rQ6_5bxqcFK95neE0lF2OW-r1HtpyH2QD4vJs';
const ABA_DADOS = 'App_Controle2';
const NOME_TABELA_DADOS = 'Dados'; // Named range (opcional)
const ABA_LISTAGEM = 'Listagem2';
const NOME_TABELA_LIST = 'List';   // Named range (opcional)

/************** FUSO & FORMATO **************/
const TIMEZONE = 'America/Campo_Grande';
const DATE_FMT = 'dd/MM/yyyy HH:mm:ss';
const nowStr_ = (d = new Date()) => Utilities.formatDate(d, TIMEZONE, DATE_FMT);
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

/************** RESPONSORES (JSON / JSONP) **************/
function jsonOut_(obj, cb) {{
  const txt = cb ? `${{cb}}(${{JSON.stringify(obj)}})` : JSON.stringify(obj);
  const out = ContentService.createTextOutput(txt);
  return out.setMimeType(cb ? ContentService.MimeType.JAVASCRIPT
                            : ContentService.MimeType.JSON);
}}
function ok_(e, obj)  {{ return jsonOut_(Object.assign({{ok:true}}, obj||{{}}), e && e.parameter && e.parameter.callback); }}
function er_(e, err)  {{ return jsonOut_({{ ok:false, error:String(err) }}, e && e.parameter && e.parameter.callback); }}

/************** ROUTER **************/
function doGet(e) {{
  try {{
    const r = String(e && e.parameter && e.parameter.route || 'home');
    if (r === 'ping')          return ok_(e, {{ service:'online', when: nowStr_() }});
    if (r === 'loginSeguranca') return ok_(e, loginSeguranca_(String(e.parameter.codigo || '').trim()));
    if (r === 'validarSessao')  return ok_(e, validarSessao_(String(e.parameter.token || '').trim()));
    if (r === 'logoutSeguranca') return ok_(e, logoutSeguranca_(String(e.parameter.token || '').trim()));
    if (r === 'home')          return ok_(e, getHomeData_());
    if (r === 'homeFast')      return ok_(e, getHomeData_());
    if (r === 'lists')         return ok_(e, getLists_());
    if (r === 'listsAvail')    return ok_(e, getListsAvail_());
    if (r === 'veiculosAvail') return ok_(e, getVeiculosAvail_());
    if (r === 'apoioSaida')    return ok_(e, getApoioSaida_());
    if (r === 'kmAtual')       return ok_(e, getKmAtual_(String(e.parameter.veiculo || '').trim()));
    if (r === 'statusVeiculo') return ok_(e, statusVeiculo_(String(e.parameter.veiculo || '').trim()));
    if (r === 'bootstrap')     return ok_(e, bootstrap_());
    if (r === 'diag')          return ok_(e, diag_());

    // Escritas via GET (temporário para bypass de CORS no front)
    if (r === 'saidaGet') {{
      const p = {{
        veiculo:   String(e.parameter.veiculo   || '').trim(),
        motorista: String(e.parameter.motorista || '').trim(),
        seguranca: String(e.parameter.seguranca || '').trim(),
        kmSaida:   String(e.parameter.kmSaida   || '').trim(),
        destino:   String(e.parameter.destino   || '').trim(),
      }};
      return ok_(e, submitSaida_(p));
    }}
    if (r === 'entradaGet') {{
      const p = {{
        veiculo:   String(e.parameter.veiculo   || '').trim(),
        kmRetorno: String(e.parameter.kmRetorno || '').trim(),
        motorista: String(e.parameter.motorista || '').trim(),
        seguranca: String(e.parameter.seguranca || '').trim(),
      }};
      return ok_(e, submitEntrada_(p));
    }}

    return er_(e, 'Rota inválida: ' + r);
  }} catch (err) {{
    return er_(e, err);
  }}
}}

function doPost(e) {{
  try {{
    const r = String(e && e.parameter && e.parameter.route || '');
    const body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(body || '{}');

    if (r === 'saida')   return jsonOut_(submitSaida_(data));
    if (r === 'entrada') return jsonOut_(submitEntrada_(data));

    return jsonOut_({{ ok:false, error:'Rota inválida: ' + r }});
  }} catch (err) {{
    return jsonOut_({{ ok:false, error:String(err) }});
  }}
}}

/************** UTIL **************/
function openSS_(){{ return SpreadsheetApp.openById(SHEET_ID); }}
function getSheetByName_(ss, name){{ const sh = ss.getSheetByName(name); if(!sh) throw new Error(`Aba "${{name}}" não encontrada.`); return sh; }}
function getNamedRange_(ss, named){{ return ss.getRangeByName(named) || null; }}
function norm_(s){{ return String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,''); }}
function findIdx_(headers, candidates){{ const H = headers.map(h=>norm_(h)); for(const c of candidates){{ const i = H.indexOf(norm_(c)); if(i>=0) return i; }} return -1; }}
function toTextList_(arr){{
  return Array.from(new Set((arr || [])
    .map(function(item){{
      const v = (item && typeof item === 'object') ? (item.nome || item.name || '') : item;
      return String(v || '').trim();
    }})
    .filter(Boolean)
  )).sort(function(a,b){{ return a.localeCompare(b, 'pt-BR'); }});
}}
function getFixedListsSafe_(){{
  try {{
    if (typeof getListasFrotaFixas === 'function') {{
      const data = getListasFrotaFixas();
      return {{ ok:true, veiculos: toTextList_(data.veiculos), motoristas: toTextList_(data.motoristas), segurancas: toTextList_(data.segurancas) }};
    }}
    if (typeof getListasFrota === 'function') {{
      const data = getListasFrota();
      return {{ ok:true, veiculos: toTextList_(data.veiculos), motoristas: toTextList_(data.motoristas), segurancas: toTextList_(data.segurancas) }};
    }}
  }} catch (err) {{
    // Em caso de erro na nova fonte local, continua no fluxo legado (planilha)
    Logger.log('Falha ao usar listas locais: ' + err);
  }}
  return null;
}}

/************** CACHE **************/
const CACHE_TTL_SEC = 45;
function cache_(){{ return CacheService.getScriptCache(); }}
function getCacheJson_(key){{ try{{ const raw = cache_().get(key); return raw ? JSON.parse(raw) : null; }}catch(_ ){{ return null; }} }}
function putCacheJson_(key, obj, ttl){{ try{{ cache_().put(key, JSON.stringify(obj), Math.max(5, Math.min(21600, ttl||CACHE_TTL_SEC))); }}catch(_ ){{}} }}
function authKey_(token){{ return 'auth:' + String(token || ''); }}
function putAuthSession_(token, data){{
  const ttlSec = Math.floor(SESSION_TTL_MS / 1000);
  putCacheJson_(authKey_(token), data, ttlSec);
}}
function getAuthSession_(token){{
  if (!token) return null;
  return getCacheJson_(authKey_(token));
}}
function removeAuthSession_(token){{
  try {{ cache_().remove(authKey_(token)); }} catch(_ ) {{}}
}}

function parseSegurancaComCodigo_(item){{
  const raw = String(item || '').trim();
  if (!raw) return null;
  const idx = raw.lastIndexOf('-');
  if (idx < 0) return null;
  const nome = raw.slice(0, idx).trim();
  const codigo = raw.slice(idx + 1).trim();
  if (!nome || !codigo) return null;
  return {{ nome:nome, codigo:codigo }};
}}

function getSegurancasComCodigo_(){{
  const lista = (typeof LISTA_SEGURANCAS !== 'undefined' && Array.isArray(LISTA_SEGURANCAS)) ? LISTA_SEGURANCAS : [];
  const out = [];
  for (var i = 0; i < lista.length; i++) {{
    const parsed = parseSegurancaComCodigo_(lista[i]);
    if (parsed) out.push(parsed);
  }}
  return out;
}}

function loginSeguranca_(codigo){{
  if (!codigo) throw new Error('Código obrigatório.');
  const base = getSegurancasComCodigo_();
  if (!base.length) throw new Error('Nenhum segurança com código foi configurado em LISTA_SEGURANCAS.');

  const hit = base.find(function(x) {{ return String(x.codigo) === String(codigo); }});
  if (!hit) throw new Error('Código inválido.');

  const token = Utilities.getUuid().replace(/-/g, '') + String(Date.now());
  const expiraEm = Date.now() + SESSION_TTL_MS;
  putAuthSession_(token, {{ seguranca: hit.nome, expiraEm: expiraEm }});

  return {{
    autenticado: true,
    token: token,
    seguranca: hit.nome,
    expiraEm: expiraEm,
    message: 'Acesso liberado.'
  }};
}}

function validarSessao_(token){{
  if (!token) return {{ autenticado:false }};
  const sess = getAuthSession_(token);
  if (!sess) return {{ autenticado:false }};
  const exp = Number(sess.expiraEm || 0);
  if (!exp || exp <= Date.now()) {{
    removeAuthSession_(token);
    return {{ autenticado:false }};
  }}
  return {{
    autenticado:true,
    seguranca: String(sess.seguranca || ''),
    expiraEm: exp
  }};
}}

function logoutSeguranca_(token){{
  if (token) removeAuthSession_(token);
  return {{ logout:true }};
}}

/*******************************************************
 * DIGEST de App_Controle2 (1 leitura → muitos índices)
 *******************************************************/
function getDadosDigest_(ss){{
  const ck = 'dadosDigest';
  const c = getCacheJson_(ck);
  if (c) return {{ inCourseSet:new Set(c.inCourseArray||[]), listInCourse:c.listInCourse||[], lastMetaByVehicle:c.lastMetaByVehicle||{{}} }};

  const aba = getSheetByName_(ss, ABA_DADOS);
  const lr = aba.getLastRow();
  const res = {{ inCourseSet:new Set(), listInCourse:[], lastMetaByVehicle:{{}} }};
  if (lr < 2) {{ putCacheJson_(ck, {{ inCourseArray:[], listInCourse:[], lastMetaByVehicle:{{}} }}); return res; }}

  const lc = aba.getLastColumn();
  const head = aba.getRange(1,1,1,lc).getValues()[0].map(h=>String(h).trim());
  const iV  = findIdx_(head, ['Veiculo','Veículo']);
  const iSt = findIdx_(head, ['Status']);
  const iKS = findIdx_(head, ['KmSaida','Km Saida']);
  const iKR = findIdx_(head, ['KmRetorno','Km Retorno']);
  const iDS = findIdx_(head, ['DataSaida','Saida','Saída']);
  const iM  = findIdx_(head, ['Motorista']);
  const iSg = findIdx_(head, ['Seguranca','Segurança']);
  if (iV < 0) {{ putCacheJson_(ck, {{ inCourseArray:[], listInCourse:[], lastMetaByVehicle:{{}} }}); return res; }}

  const rows = aba.getRange(2,1,lr-1,lc).getValues();
  const lastIdx = new Map();
  rows.forEach((r,i)=>{{ const v=String(r[iV]||'').trim(); if(v) lastIdx.set(v,i); }});

  const inArr=[], listDisp=[], meta={{}};
  for (const [disp, idx] of lastIdx.entries()){{
    const r = rows[idx];
    const key = norm_(disp);
    const st = iSt>=0 ? String(r[iSt]||'').toLowerCase() : '';
    const ret= iKR>=0 ? r[iKR] : '';
    const temRet = !!ret && String(ret).trim()!=='';
    const emCurso = !temRet && (iSt>=0 ? !st.includes('conclu') : true);

    const kmRet = iKR>=0 ? Number(r[iKR]) : NaN;
    const kmSai = iKS>=0 ? Number(r[iKS]) : NaN;
    const kmAtual = Number.isFinite(kmRet) && kmRet>0 ? kmRet : (Number.isFinite(kmSai) ? kmSai : 0);

    const ds = iDS>=0 ? r[iDS] : '';
    const dataSaida = (ds instanceof Date) ? nowStr_(ds) : String(ds||'');

    meta[key] = {{ display:disp, kmAtual, kmSaida:Number.isFinite(kmSai)?kmSai:null, motorista:iM>=0?String(r[iM]||''):'', seguranca:iSg>=0?String(r[iSg]||''):'', dataSaida, emCurso }};
    if (emCurso) {{ inArr.push(key); listDisp.push(disp); }}
  }}

  putCacheJson_(ck, {{ inCourseArray:inArr, listInCourse:listDisp, lastMetaByVehicle:meta }});
  return {{ inCourseSet:new Set(inArr), listInCourse:listDisp, lastMetaByVehicle:meta }};
}}

/************** HOME **************/
function getHomeData_(){{
  const ck='homeData'; const c=getCacheJson_(ck); if(c) return c;
  const ss=openSS_();
  const out={{ ok:true, online:true, totalVeiculos:getTotalVeiculos__(ss), recentes:getMovimentacaoRecente__(ss,5) }};
  putCacheJson_(ck,out); return out;
}}
function getTotalVeiculos__(ss){{
  const aba=getSheetByName_(ss,ABA_LISTAGEM); let r=getNamedRange_(ss,NOME_TABELA_LIST); if(!r) r=aba.getRange(1,1,aba.getLastRow(),aba.getLastColumn());
  const vals=r.getValues(); if(vals.length<2) return 0; const head=vals[0].map(h=>String(h).trim()); const iV=findIdx_(head,['Veiculo','Veículo']); if(iV<0) return 0;
  const set=new Set(); for(let i=1;i<vals.length;i++){{ const v=vals[i][iV]; if(v) set.add(String(v).trim()); }} return set.size;
}}
function getMovimentacaoRecente__(ss,limit){{
  const aba=getSheetByName_(ss,ABA_DADOS); const lr=aba.getLastRow(); if(lr<2) return []; const lc=aba.getLastColumn();
  const head=aba.getRange(1,1,1,lc).getValues()[0].map(h=>String(h).trim());
  const iV=findIdx_(head,['Veiculo','Veículo']); const iSt=findIdx_(head,['Status']); const iSa=findIdx_(head,['DataSaida','Saida','Saída']); const iRe=findIdx_(head,['Retorno','DataRetorno']); const iM=findIdx_(head,['Motorista']); const iSg=findIdx_(head,['Seguranca','Segurança']); const iKS=findIdx_(head,['KmSaida','Km Saida']); const iKR=findIdx_(head,['KmRetorno','Km Retorno']);
  if(iV<0) return [];
  const rows=aba.getRange(2,1,lr-1,lc).getValues(); const out=[];
  for(let i=rows.length-1;i>=0 && out.length<limit;i--){{ const r=rows[i]; const st=iSt>=0?String(r[iSt]||'').toLowerCase():''; const ret=iRe>=0?r[iRe]:''; const disp=(st && st.includes('conclu')) || (ret && String(ret).trim()!=='');
    const saida=(iSa>=0 && r[iSa] instanceof Date)? nowStr_(r[iSa]) : (iSa>=0? String(r[iSa]||'') : '');
    const retorno=(iRe>=0 && r[iRe] instanceof Date)? nowStr_(r[iRe]) : (iRe>=0? String(r[iRe]||'') : '');
    out.push({{ veiculo:String(r[iV]||''), motorista:iM>=0?String(r[iM]||''):'', seguranca:iSg>=0?String(r[iSg]||''):'', status:disp?'DISPONÍVEL':'EM CURSO', corStatus:disp?'ok':'warn', saida, retorno, kmSaida:iKS>=0?r[iKS]:null, kmRetorno:iKR>=0?r[iKR]:null }});
  }} return out;
}}

/************** LISTAS & DISP **************/
function getLists_(){{
  const fix = getFixedListsSafe_();
  if (fix) return fix;
  const ss=openSS_(); const aba=getSheetByName_(ss,ABA_LISTAGEM); let r=getNamedRange_(ss,NOME_TABELA_LIST); if(!r) r=aba.getRange(1,1,aba.getLastRow(),aba.getLastColumn());
  const vals=r.getValues(); if(vals.length<2) return {{ ok:true, veiculos:[], motoristas:[], segurancas:[] }};
  const head=vals[0].map(h=>String(h).trim()); const iV=findIdx_(head,['Veiculo','Veículo']); const iM=findIdx_(head,['Motorista']); const iSg=findIdx_(head,['Seguranca','Segurança']); if(iV<0||iM<0||iSg<0) throw new Error('Cabeçalhos ausentes em "Listagem2".');
  const ve=new Set(), mo=new Set(), sg=new Set(); for(let i=1;i<vals.length;i++){{ if(vals[i][iV]) ve.add(String(vals[i][iV]).trim()); if(vals[i][iM]) mo.add(String(vals[i][iM]).trim()); if(vals[i][iSg]) sg.add(String(vals[i][iSg]).trim()); }}
  return {{ ok:true, veiculos:[...ve], motoristas:[...mo], segurancas:[...sg] }};
}}
function getListsAvail_(){{
  const ck='listsAvail'; const c=getCacheJson_(ck); if(c) return c; const lists=getLists_(); const ss=openSS_(); const d=getDadosDigest_(ss);
  const disp=[], ocp=[]; (lists.veiculos||[]).forEach(v=>{{ if(d.inCourseSet.has(norm_(v))) ocp.push(v); else disp.push(v); }});
  const veiculosNaRua = Array.from(new Set([...ocp, ...d.listInCourse])).map(function(v){{
    const m = d.lastMetaByVehicle[norm_(v)] || {{}};
    return {{
      veiculo: v,
      motorista: m.motorista || '',
      kmSaida: Number(m.kmSaida || 0)
    }};
  }});
  const out={{ ok:true, veiculosDisponiveis:disp, veiculosEmCurso:veiculosNaRua.map(function(x){{ return x.veiculo; }}), veiculosNaRua:veiculosNaRua, emTransito:veiculosNaRua, motoristas:lists.motoristas, segurancas:lists.segurancas }};
  putCacheJson_(ck,out); return out;
}}

function getVeiculosAvail_(){{
  const l = getListsAvail_();
  return {{ ok:true, veiculos:l.veiculosDisponiveis || [] }};
}}

function getApoioSaida_(){{
  const l = getLists_();
  return {{ ok:true, motoristas:l.motoristas || [], segurancas:l.segurancas || [] }};
}}

/************** KM + STATUS **************/
function getKmAtual_(veiculo){{ if(!veiculo) return {{ ok:true, kmAtual:0, km:0 }}; const ss=openSS_(); const d=getDadosDigest_(ss); const m=d.lastMetaByVehicle[norm_(veiculo)]; const valor = m?Number(m.kmAtual||0):0; return {{ ok:true, kmAtual: valor, km: valor }}; }}
function statusVeiculo_(veiculo){{ const ss=openSS_(); const d=getDadosDigest_(ss); const key=norm_(veiculo); const m=d.lastMetaByVehicle[key]; const em=d.inCourseSet.has(key); const out={{ ok:true, emCurso:em, kmAtual: m?m.kmAtual:0 }}; if(m && em){{ out.motorista=m.motorista; out.seguranca=m.seguranca; out.kmSaida=m.kmSaida; out.dataSaida=m.dataSaida; }} return out; }}

/************** SAÍDA / ENTRADA **************/
function submitSaida_(p){{ ['veiculo','motorista','seguranca','kmSaida','destino'].forEach(k=>{{ if(!p[k]||String(p[k]).trim()==='') throw new Error(`Campo obrigatório: ${{k}}`); }});
  const ss=openSS_(); if(getDadosDigest_(ss).inCourseSet.has(norm_(p.veiculo))) throw new Error('Veículo NÃO disponível: saída em curso.');
  const aba=getSheetByName_(ss,ABA_DADOS); const lc=aba.getLastColumn(); const headers=aba.getRange(1,1,1,lc).getValues()[0].map(h=>String(h).trim());
  const col={{ Veiculo:findIdx_(headers,['Veiculo','Veículo']), Motorista:findIdx_(headers,['Motorista']), Seguranca:findIdx_(headers,['Seguranca','Segurança']), KmSaida:findIdx_(headers,['KmSaida','Km Saida']), Destino:findIdx_(headers,['Destino']), DataSaida:findIdx_(headers,['DataSaida','Saida','Saída']), Status:findIdx_(headers,['Status']), KmRetorno:findIdx_(headers,['KmRetorno','Km Retorno']), KmRodado:findIdx_(headers,['KmRodado','Km Rodado']), Retorno:findIdx_(headers,['Retorno','DataRetorno']) }};
  const miss=Object.keys(col).filter(k=>col[k]<0); if(miss.length) throw new Error('Colunas não encontradas: '+miss.join(', '));
  const kmA=getKmAtual_(String(p.veiculo).trim()).kmAtual; const kmS=Number(p.kmSaida); if(!Number.isFinite(kmS)) throw new Error('KmSaida inválido.'); if(kmS<kmA) throw new Error(`Km Saída (${{kmS}}) menor que Km atual (${{kmA}}).`);
  const now=new Date(); const row=new Array(headers.length).fill(''); row[col.Veiculo]=String(p.veiculo).trim(); row[col.Motorista]=String(p.motorista).trim(); row[col.Seguranca]=String(p.seguranca).trim(); row[col.KmSaida]=kmS; row[col.Destino]=String(p.destino).trim(); row[col.DataSaida]=nowStr_(now); row[col.Status]='Em Curso'; row[col.KmRetorno]=''; row[col.KmRodado]=''; row[col.Retorno]='';
  aba.appendRow(row); cache_().removeAll(['dadosDigest','listsAvail','homeData','bootstrap']); return {{ ok:true, message:'Saída registrada com sucesso.', timestamp: nowStr_(now) }};
}}
function submitEntrada_(p){{ ['veiculo','kmRetorno'].forEach(k=>{{ if(!p[k]||String(p[k]).trim()==='') throw new Error(`Campo obrigatório: ${{k}}`); }});
  const ss=openSS_(); const aba=getSheetByName_(ss,ABA_DADOS); const lr=aba.getLastRow(); if(lr<2) throw new Error('Não há registros.'); const lc=aba.getLastColumn();
  const head=aba.getRange(1,1,1,lc).getValues()[0].map(h=>String(h).trim()); const iV=findIdx_(head,['Veiculo','Veículo']); const iKS=findIdx_(head,['KmSaida','Km Saida']); const iSt=findIdx_(head,['Status']); const iKR=findIdx_(head,['KmRetorno','Km Retorno']); const iKD=findIdx_(head,['KmRodado','Km Rodado']); const iDR=findIdx_(head,['Retorno','DataRetorno']); const iM=findIdx_(head,['Motorista']); const iSg=findIdx_(head,['Seguranca','Segurança']); if([iV,iKS,iSt,iKR,iKD,iDR].some(i=>i<0)) throw new Error('Colunas esperadas não encontradas.');
  const rows=aba.getRange(2,1,lr-1,lc).getValues(); const alvo=norm_(p.veiculo); let idx=-1; for(let i=rows.length-1;i>=0;i--){{ const v=norm_(rows[i][iV]||''); const st=String(rows[i][iSt]||'').toLowerCase(); if(v===alvo && !st.includes('conclu')){{ idx=i; break; }} }} if(idx<0) throw new Error('Nenhuma saída em aberto para este veículo.');
  const abs=2+idx; const kmSaida=Number(rows[idx][iKS]||0); const kmRet=Number(p.kmRetorno); if(!Number.isFinite(kmRet)) throw new Error('KmRetorno inválido.'); if(kmRet<kmSaida) throw new Error(`KmRetorno menor que KmSaida (${{kmSaida}}).`);
  const kmRod=kmRet-kmSaida; const now=nowStr_(new Date()); aba.getRange(abs,iKR+1).setValue(kmRet); aba.getRange(abs,iKD+1).setValue(kmRod); aba.getRange(abs,iDR+1).setValue(now); aba.getRange(abs,iSt+1).setValue('Concluído'); if(p.motorista && iM>=0) aba.getRange(abs,iM+1).setValue(String(p.motorista).trim()); if(p.seguranca && iSg>=0) aba.getRange(abs,iSg+1).setValue(String(p.seguranca).trim()); cache_().removeAll(['dadosDigest','listsAvail','homeData','bootstrap']); return {{ ok:true, message:'Entrada registrada com sucesso.', kmRodado:kmRod, dataRetorno:now }};
}}

/************** AGRUPADO **************/
function bootstrap_(){{ const ck='bootstrap'; const c=getCacheJson_(ck); if(c) return c; const out={{ ok:true, listsAvail:getListsAvail_(), home:getHomeData_() }}; putCacheJson_(ck,out); return out; }}

/************** DIAGNÓSTICO **************/
function diag_(){{ const ss=openSS_(); return {{ ok:true, sheetId:SHEET_ID, fileName:ss.getName(), sheets:ss.getSheets().map(s=>s.getName()), time: nowStr_() }}; }}
