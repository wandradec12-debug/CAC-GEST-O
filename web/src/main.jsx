import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';
const API=import.meta.env.VITE_API_URL||'http://localhost:3001';
const empty={codigo:'',nome_completo:'',cpf_cnpj:'',nascimento:'',naturalidade:'',filiacao_pai:'',filiacao_mae:'',estado_civil:'',rg:'',rg_orgao:'',tipo_cliente:'Pessoa Física',telefone:'',whatsapp:'',email:'',cep:'',endereco:'',numero:'',complemento:'',bairro:'',cidade:'',estado:'',origem_cadastro:'',responsavel:'',status:'ativo',categoria_cac:'',cr_numero:'',cr_emissao:'',cr_validade:'',cr_situacao:'',cr_orgao:'',observacoes:''};
function F({label,name,type='text',required=false,form,setForm}){return <label><span>{label}{required?' *':''}</span><input type={type} value={form[name]||''} required={required} onChange={e=>setForm(prev=>({...prev,[name]:e.target.value}))}/></label>}

function formatDateBR(value){
  if(!value)return '';
  const raw=String(value).trim();
  const iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(iso)return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const br=raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(br)return raw;
  return '';
}
function formatDateInput(value){
  if(!value)return '';
  const raw=String(value).trim();
  const iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(iso)return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const br=raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return br ? `${br[3]}-${br[2]}-${br[1]}` : '';
}
function formatDeclaracaoDate(value){
  if(value===null||value===undefined||value==='')return '';
  const raw=String(value).trim();
  let m=raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  if(m)return `${m[3]}/${m[2]}/${m[1]}`;
  m=raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(m)return raw;
  return '';
}
function gerarDeclaracao(detail){
  const nome=(detail.nome_completo||detail.razao_social||detail.nome||'').toUpperCase();
  const naturalidade=(detail.naturalidade||'').toUpperCase();
  const nascimento=formatDeclaracaoDate(detail.nascimento||detail.data_nascimento||detail.dataNascimento||detail.data_de_nascimento);
  const pai=(detail.filiacao_pai||'').toUpperCase();
  const mae=(detail.filiacao_mae||'').toUpperCase();
  const estadoCivil=(detail.estado_civil||'').toUpperCase();
  const endereco=[detail.endereco,detail.numero,detail.complemento,detail.bairro].filter(Boolean).join(', ');
  const cep=detail.cep||'';
  const cidade=(detail.cidade||'').toUpperCase();
  const estado=(detail.estado||'').toUpperCase();
  const rg=detail.rg||'';
  const cpf=detail.cpf_cnpj||'';
  const w=window.open('','_blank','width=900,height=900');
  if(!w)return;
  const esc=v=>String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>DECLARAÇÃO DE INEXISTÊNCIA DE INQUÉRITOS POLICIAIS OU PROCESSOS CRIMINAIS</title><style>body{font-family:"Times New Roman",serif;color:#000;margin:70px 80px;font-size:16px;line-height:1.55}h1{text-align:center;font-size:17px;margin:0 0 36px;font-weight:700}p{margin:0 0 18px;text-align:justify}.art{margin-top:30px}.validade{margin-top:28px}.local{margin-top:28px}.assinatura{text-align:center;margin-top:42px}.cpf{text-align:center;margin-top:4px}@media print{body{margin:45px 60px}}</style></head><body>');
  w.document.write('<h1>DECLARAÇÃO DE INEXISTÊNCIA DE INQUÉRITOS POLICIAIS OU<br>PROCESSOS CRIMINAIS</h1>');
  w.document.write('<p>Eu, <strong>'+esc(nome)+'</strong>, BRASILEIRO, natural de <strong>'+esc(naturalidade)+'</strong>, nascido em <strong>'+esc(nascimento)+'</strong>, filho(a) de <strong>'+esc(pai)+'</strong> e <strong>'+esc(mae)+'</strong>, <strong>'+esc(estadoCivil)+'</strong> residência no(a), <strong>'+esc(endereco)+'</strong>, CEP <strong>'+esc(cep)+'</strong>, '+esc(cidade)+' - '+esc(estado)+' RG nº <strong>'+esc(rg)+'</strong>, declaro, sob as penas da lei, que não respondo a inquéritos policiais nem a processos criminais no estado de domicílio e nos entes federativos, e estou ciente de que, em caso de falsidade ideológica, ficarei sujeito às sanções prescritas no Código Penal e às demais cominações legais aplicáveis.</p>');
  w.document.write('<p class="art">Art. 299 - Omitir, em documento público ou particular, declaração que nele deveria constar, ou nele inserir ou fazer inserir declaração falsa ou diversa da que devia ser escrita, com o fim de prejudicar direito, criar obrigação ou alterar a verdade sobre o fato juridicamente relevante.</p>');
  w.document.write('<p>Pena - reclusão de 1 (um) a 5 (cinco) anos e multa, se o documento é público e reclusão de 1 (um) a 3 (três) anos, se o documento é particular.</p>');
  w.document.write('<p class="validade">Esta declaração tem validade até a data: 20/12/2026</p>');
  w.document.write('<p class="local">Salvador- BA, 21 de setembro de 2026</p>');
  w.document.write('<p class="assinatura"><strong>'+esc(nome)+'</strong></p>');
  w.document.write('<p class="cpf">CPF Nº '+esc(cpf)+'</p>');
  w.document.write('</body></html>');
  w.document.close();
  w.focus();
  setTimeout(()=>w.print(),300);
}

function App(){const[token,setToken]=useState(localStorage.getItem('token'));const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[dash,setDash]=useState(null);const[clientes,setClientes]=useState([]);const[show,setShow]=useState(false);const[detail,setDetail]=useState(null);const[form,setForm]=useState(empty);const[editing,setEditing]=useState(false);const[erro,setErro]=useState('');const[ok,setOk]=useState('');
const login=async e=>{e.preventDefault();setErro('');try{const r=await fetch(API+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error);localStorage.setItem('token',d.token);setToken(d.token)}catch(x){setErro(x.message)}};
const load=async()=>{const h={Authorization:'Bearer '+token};const[a,b]=await Promise.all([fetch(API+'/api/dashboard',{headers:h}),fetch(API+'/api/clientes',{headers:h})]);if(a.status===401){localStorage.removeItem('token');setToken(null);return}setDash(await a.json());setClientes(await b.json())};
useEffect(()=>{if(token)load()},[token]);
const save=async e=>{e.preventDefault();setErro('');setOk('');const r=await fetch(API+(editing?'/api/clientes/'+form.id:'/api/clientes'),{method:editing?'PUT':'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(form)});const d=await r.json();if(!r.ok){setErro(d.error||'Não foi possível salvar');return}setOk(editing?'Cliente atualizado com sucesso.':'Cliente cadastrado com sucesso.');setForm(empty);setEditing(false);await load();setTimeout(()=>setShow(false),700)};
if(!token)return <main className="login"><section><h1>CAC GESTÃO</h1><p>Controle e gestão de clientes</p><form onSubmit={login}><input placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button>Entrar</button>{erro&&<small>{erro}</small>}</form></section></main>;
return <main><header><div><h1>CAC GESTÃO</h1><p>Controle e gestão de clientes</p></div><button className="secondary" onClick={()=>{localStorage.removeItem('token');setToken(null)}}>Sair</button></header>
<div className="toolbar"><h2>Dashboard</h2><button onClick={()=>{setErro('');setOk('');setEditing(false);setForm(empty);setShow(true)}}>+ Novo cliente</button></div>
<div className="cards">{dash&&Object.entries(dash).map(([k,v])=><article key={k}><b>{v}</b><span>{k}</span></article>)}</div>
<section className="panel"><div className="panelhead"><h2>Clientes cadastrados</h2><span>{clientes.length} registro(s)</span></div>{clientes.map(c=><div className="row" key={c.id}><div><button className="nameButton" onClick={async()=>{setErro('');try{const r=await fetch(API+'/api/clientes/'+c.id,{headers:{Authorization:'Bearer '+token}});const d=await r.json();if(r.ok)setDetail(d);else setErro(d.error||'Erro ao consultar cliente')}catch(e){setErro('Erro ao consultar cliente')}}}>{c.nome_completo||c.nome||c.razao_social}</button><small>{c.cpf_cnpj||'Sem CPF/CNPJ'} · {c.cidade||'Cidade não informada'}</small></div><span>{c.categoria_cac||c.tipo_cliente||'—'}</span><span className={c.status==='ativo'?'active':''}>{c.status}</span></div>)}{!clientes.length&&<p>Nenhum cliente cadastrado.</p>}</section>
{detail&&<div className="overlay"><section className="modal detailModal"><div className="modalhead"><div><h2>{detail.nome_completo||detail.nome||detail.razao_social}</h2><p>Perfil do cliente</p></div><button className="close" onClick={()=>setDetail(null)}>×</button></div><div className="detailGrid">{[['Código',detail.codigo],['CPF/CNPJ',detail.cpf_cnpj],['Nascimento',formatDeclaracaoDate(detail.nascimento||detail.data_nascimento||detail.dataNascimento||detail.data_de_nascimento)],['Naturalidade',detail.naturalidade],['Filiação - Pai',detail.filiacao_pai],['Filiação - Mãe',detail.filiacao_mae],['Estado civil',detail.estado_civil],['RG',detail.rg],['Órgão RG',detail.rg_orgao],['Tipo',detail.tipo_cliente],['Status',detail.status],['Telefone',detail.telefone],['WhatsApp',detail.whatsapp],['E-mail',detail.email],['Endereço',[detail.endereco,detail.numero,detail.complemento].filter(Boolean).join(', ')],['Cidade',[detail.cidade,detail.estado].filter(Boolean).join(' - ')],['Categoria CAC',detail.categoria_cac],['Número do CR',detail.cr_numero],['Validade do CR',detail.cr_validade],['Situação do CR',detail.cr_situacao],['Órgão emissor',detail.cr_orgao],['Responsável',detail.responsavel],['Origem do cadastro',detail.origem_cadastro]].map(([l,v])=><div className="detailItem" key={l}><span>{l}</span><b>{v||'—'}</b></div>)}</div><div className="detailObs"><span>Observações</span><p>{detail.observacoes||'—'}</p></div><div className="actions"><button className="secondary" onClick={()=>setDetail(null)}>Fechar</button><button className="secondary" onClick={()=>gerarDeclaracao(detail)}>Gerar declaração</button><button onClick={()=>{setForm({...empty,...detail,nascimento:formatDateInput(detail.nascimento),cr_emissao:formatDateInput(detail.cr_emissao),cr_validade:formatDateInput(detail.cr_validade)});setEditing(true);setDetail(null);setShow(true)}}>Editar cliente</button></div></section></div>}{show&&<div className="overlay"><section className="modal"><div className="modalhead"><div><h2>{editing?'Editar cliente':'Novo cliente'}</h2><p>Cadastro completo do cliente</p></div><button className="close" onClick={()=>{setShow(false);setEditing(false)}}>×</button></div><form onSubmit={save}>
<h3>1. Identificação</h3><div className="grid"><F label="Código" name="codigo" form={form} setForm={setForm}/><F label="Nome completo / Razão social" name="nome_completo" required form={form} setForm={setForm}/><F label="CPF/CNPJ" name="cpf_cnpj" required form={form} setForm={setForm}/><F label="Data de nascimento / fundação" name="nascimento" type="date" form={form} setForm={setForm}/><F label="Naturalidade" name="naturalidade" form={form} setForm={setForm}/><F label="Filiação - Pai" name="filiacao_pai" form={form} setForm={setForm}/><F label="Filiação - Mãe" name="filiacao_mae" form={form} setForm={setForm}/><F label="Estado civil" name="estado_civil" form={form} setForm={setForm}/><F label="RG" name="rg" form={form} setForm={setForm}/><F label="Órgão RG" name="rg_orgao" form={form} setForm={setForm}/><label><span>Tipo de cliente</span><select value={form.tipo_cliente} onChange={e=>setForm({...form,tipo_cliente:e.target.value})}><option>Pessoa Física</option><option>Pessoa Jurídica</option></select></label><label><span>Status</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="bloqueado">Bloqueado</option></select></label></div>
<h3>2. Contatos</h3><div className="grid"><F label="Telefone" name="telefone" form={form} setForm={setForm}/><F label="WhatsApp" name="whatsapp" form={form} setForm={setForm}/><F label="E-mail" name="email" form={form} setForm={setForm}/></div>
<h3>3. Endereço</h3><div className="grid"><F label="CEP" name="cep" form={form} setForm={setForm}/><F label="Endereço" name="endereco" form={form} setForm={setForm}/><F label="Número" name="numero" form={form} setForm={setForm}/><F label="Complemento" name="complemento" form={form} setForm={setForm}/><F label="Bairro" name="bairro" form={form} setForm={setForm}/><F label="Cidade" name="cidade" form={form} setForm={setForm}/><F label="Estado" name="estado" form={form} setForm={setForm}/></div>
<h3>4. Gestão do cadastro</h3><div className="grid"><F label="Origem do cadastro" name="origem_cadastro" form={form} setForm={setForm}/><F label="Responsável" name="responsavel" form={form} setForm={setForm}/></div>
<h3>5. Perfil CAC</h3><div className="grid"><F label="Categoria CAC" name="categoria_cac" form={form} setForm={setForm}/><F label="Número do CR" name="cr_numero" form={form} setForm={setForm}/><F label="Emissão do CR" name="cr_emissao" type="date" form={form} setForm={setForm}/><F label="Validade do CR" name="cr_validade" type="date" form={form} setForm={setForm}/><label><span>Situação do CR</span><select value={form.cr_situacao} onChange={e=>setForm({...form,cr_situacao:e.target.value})}><option value="">Selecione</option><option>Regular</option><option>Próximo do vencimento</option><option>Vencido</option><option>Em análise</option></select></label><F label="Órgão emissor" name="cr_orgao" form={form} setForm={setForm}/></div>
<h3>6. Observações</h3><textarea rows="4" value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})} placeholder="Informações relevantes sobre o cliente..."/>
{erro&&<div className="msg error">{erro}</div>}{ok&&<div className="msg success">{ok}</div>}<div className="actions"><button type="button" className="secondary" onClick={()=>{setShow(false);setEditing(false)}}>Cancelar</button><button type="submit">{editing?'Salvar alterações':'Salvar cliente'}</button></div></form></section></div>}</main>}
createRoot(document.getElementById('root')).render(<App/>);