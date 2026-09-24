import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';
const API=import.meta.env.VITE_API_URL||'http://localhost:3001';
const empty={codigo:'',nome_completo:'',cpf_cnpj:'',nascimento:'',naturalidade:'',filiacao_pai:'',filiacao_mae:'',estado_civil:'',rg:'',rg_orgao:'',tipo_cliente:'Pessoa Física',telefone:'',whatsapp:'',email:'',cep:'',endereco:'',numero:'',complemento:'',bairro:'',cidade:'',estado:'',origem_cadastro:'',responsavel:'',status:'ativo',categoria_cac:'',cr_numero:'',cr_emissao:'',cr_validade:'',cr_situacao:'',cr_orgao:'',observacoes:''};
function F({label,name,type='text',required=false,form,setForm}){return <label><span>{label}{required?' *':''}</span><input type={type} value={form[name]||''} required={required} onChange={e=>setForm(prev=>({...prev,[name]:e.target.value}))}/></label>}

function getDateParts(value){
  if(value===null||value===undefined||value==='')return null;
  const raw=String(value).trim().split('T')[0];
  const iso=raw.split('-');
  if(iso.length===3&&iso[0].length===4&&iso[1].length===2&&iso[2].length===2){
    return {y:iso[0],m:iso[1],d:iso[2]};
  }
  const br=raw.split('/');
  if(br.length===3&&br[0].length===2&&br[1].length===2&&br[2].length===4){
    return {y:br[2],m:br[1],d:br[0]};
  }
  return null;
}
function formatDateBR(value){
  const p=getDateParts(value);
  return p ? p.d+'/'+p.m+'/'+p.y : '';
}
function formatDateInput(value){
  const p=getDateParts(value);
  return p ? p.y+'-'+p.m+'-'+p.d : '';
}
function getNascimento(detail){
  return formatDeclaracaoDate(detail?.nascimento ?? detail?.data_nascimento ?? detail?.dataNascimento);
}
function formatDeclaracaoDate(value){
  const p=getDateParts(value);
  return p ? p.d+'/'+p.m+'/'+p.y : '';
}
function nomeCliente(d){return String(d?.nome_completo||d?.razao_social||d?.nome||'').toUpperCase()}
function enderecoCliente(d){return [d?.endereco,d?.numero,d?.bairro].filter(Boolean).join(', ')}
function cidadeEstadoCliente(d){return [d?.cidade,d?.estado].filter(Boolean).join(' - ')}
function App(){const[token,setToken]=useState(localStorage.getItem('token'));const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[dash,setDash]=useState(null);const[clientes,setClientes]=useState([]);const[show,setShow]=useState(false);const[detail,setDetail]=useState(null);const[form,setForm]=useState(empty);const[editing,setEditing]=useState(false);const[erro,setErro]=useState('');const[ok,setOk]=useState('');
const [declaracao,setDeclaracao]=useState(null);
const login=async e=>{e.preventDefault();setErro('');try{const r=await fetch(API+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error);localStorage.setItem('token',d.token);setToken(d.token)}catch(x){setErro(x.message)}};
const load=async()=>{
  try{
    const h={Authorization:'Bearer '+token};
    const [a,b]=await Promise.all([fetch(API+'/api/dashboard',{headers:h}),fetch(API+'/api/clientes',{headers:h})]);
    if(a.status===401||b.status===401){localStorage.removeItem('token');setToken(null);return}
    const da=await a.json(); const db=await b.json();
    if(!a.ok)throw new Error(da.error||'Erro ao carregar dashboard');
    if(!b.ok)throw new Error(db.error||'Erro ao carregar clientes');
    setDash(da);setClientes(db);
  }catch(e){setErro(e.message||'Não foi possível carregar os dados');}
};
useEffect(()=>{if(token)load()},[token]);
const save=async e=>{
  e.preventDefault();setErro('');setOk('');
  try{
    const r=await fetch(API+(editing?'/api/clientes/'+form.id:'/api/clientes'),{method:editing?'PUT':'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(form)});
    const d=await r.json();
    if(!r.ok){setErro(d.error||'Não foi possível salvar');return}
    setOk(editing?'Cliente atualizado com sucesso.':'Cliente cadastrado com sucesso.');
    setForm({...empty});setEditing(false);await load();setTimeout(()=>setShow(false),700);
  }catch(e){setErro('Não foi possível salvar o cliente. Verifique a conexão com o sistema.');}
};
if(!token)return <main className="login"><section><h1>CAC GESTÃO</h1><p>Controle e gestão de clientes</p><form onSubmit={login}><input placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button>Entrar</button>{erro&&<small>{erro}</small>}</form></section></main>;
return <main><header><div><h1>CAC GESTÃO</h1><p>Controle e gestão de clientes</p></div><button className="secondary" onClick={()=>{localStorage.removeItem('token');setToken(null)}}>Sair</button></header>
<div className="toolbar"><h2>Dashboard</h2><button onClick={()=>{setErro('');setOk('');setEditing(false);setForm(empty);setShow(true)}}>+ Novo cliente</button></div>
<div className="cards">{dash&&Object.entries(dash).map(([k,v])=><article key={k}><b>{v}</b><span>{k}</span></article>)}</div>
<section className="panel"><div className="panelhead"><h2>Clientes cadastrados</h2><span>{clientes.length} registro(s)</span></div>{clientes.map(c=><div className="row" key={c.id}><div><button className="nameButton" onClick={async()=>{setErro('');try{const r=await fetch(API+'/api/clientes/'+c.id,{headers:{Authorization:'Bearer '+token}});const d=await r.json();if(r.ok)setDetail(d);else setErro(d.error||'Erro ao consultar cliente')}catch(e){setErro('Erro de comunicação ao consultar cliente')}}}>{c.nome_completo||c.nome||c.razao_social}</button><small>{c.cpf_cnpj||'Sem CPF/CNPJ'} · {c.cidade||'Cidade não informada'}</small></div><span>{c.categoria_cac||c.tipo_cliente||'—'}</span><span className={c.status==='ativo'?'active':''}>{c.status}</span></div>)}{!clientes.length&&<p>Nenhum cliente cadastrado.</p>}</section>
{detail&&<div className="overlay"><section className="modal detailModal"><div className="modalhead"><div><h2>{detail.nome_completo||detail.nome||detail.razao_social}</h2><p>Perfil do cliente</p></div><button className="close" onClick={()=>setDetail(null)}>×</button></div><div className="detailGrid">{[['Código',detail.codigo],['CPF/CNPJ',detail.cpf_cnpj],['Nascimento',formatDeclaracaoDate(detail.nascimento||detail.data_nascimento||detail.dataNascimento||detail.data_de_nascimento)],['Naturalidade',detail.naturalidade],['Filiação - Pai',detail.filiacao_pai],['Filiação - Mãe',detail.filiacao_mae],['Estado civil',detail.estado_civil],['RG',detail.rg],['Órgão RG',detail.rg_orgao],['Tipo',detail.tipo_cliente],['Status',detail.status],['Telefone',detail.telefone],['WhatsApp',detail.whatsapp],['E-mail',detail.email],['Endereço',[detail.endereco,detail.numero,detail.complemento].filter(Boolean).join(', ')],['Cidade',[detail.cidade,detail.estado].filter(Boolean).join(' - ')],['Categoria CAC',detail.categoria_cac],['Número do CR',detail.cr_numero],['Validade do CR',detail.cr_validade],['Situação do CR',detail.cr_situacao],['Órgão emissor',detail.cr_orgao],['Responsável',detail.responsavel],['Origem do cadastro',detail.origem_cadastro]].map(([l,v])=><div className="detailItem" key={l}><span>{l}</span><b>{v||'—'}</b></div>)}</div><div className="detailObs"><span>Observações</span><p>{detail.observacoes||'—'}</p></div><div className="actions"><button className="secondary" onClick={()=>setDetail(null)}>Fechar</button><button type="button" onClick={()=>setDeclaracao({tipo:'menu',detail:{...detail}})}>Gerar declaração</button><button onClick={()=>{setForm({...empty,...detail,nascimento:formatDateInput(detail.nascimento),cr_emissao:formatDateInput(detail.cr_emissao),cr_validade:formatDateInput(detail.cr_validade)});setEditing(true);setDetail(null);setShow(true)}}>Editar cliente</button></div></section></div>}
{declaracao&&declaracao.tipo==='menu'&&detail&&<div className="declarationInlineMenu">
  <div className="declarationInlineHeader"><strong>Selecione a declaração</strong><button type="button" className="close" onClick={()=>setDeclaracao(null)}>×</button></div>
  <button type="button" className="declarationOption" onClick={()=>setDeclaracao({tipo:'inexistencia',detail})}><strong>Declaração de Inexistência de Inquéritos Policiais ou Processos Criminais</strong><span>Utiliza os dados pessoais, filiação e endereço.</span></button>
  <button type="button" className="declarationOption" onClick={()=>setDeclaracao({tipo:'titular-form',detail,titular:{nome:'',rg:'',cpf:''}})}><strong>Declaração do Titular do Endereço</strong><span>Informe os dados do titular do imóvel.</span></button>
  <button type="button" className="declarationOption" onClick={()=>setDeclaracao({tipo:'dsa',detail})}><strong>Declaração de Segurança do Acervo (DSA)</strong><span>Utiliza os dados pessoais e do endereço do cliente.</span></button>
</div>}

{declaracao&&declaracao.tipo!=='menu'&&<div className="overlay declarationOverlay">
{declaracao.tipo==='titular-form'&&<section className="modal declarationChooser">
  <div className="modalhead"><div><h2>Declaração do Titular do Endereço</h2><p>Informe os dados do titular do imóvel</p></div><button type="button" className="close" onClick={()=>setDeclaracao(null)}>×</button></div>
  <div className="grid declarationFormGrid">
    <label><span>Nome do titular *</span><input value={declaracao.titular?.nome||''} onChange={e=>setDeclaracao(prev=>({...prev,titular:{...prev.titular,nome:e.target.value}}))}/></label>
    <label><span>RG do titular</span><input value={declaracao.titular?.rg||''} onChange={e=>setDeclaracao(prev=>({...prev,titular:{...prev.titular,rg:e.target.value}}))}/></label>
    <label><span>CPF do titular *</span><input value={declaracao.titular?.cpf||''} onChange={e=>setDeclaracao(prev=>({...prev,titular:{...prev.titular,cpf:e.target.value}}))}/></label>
  </div>
  <div className="actions"><button type="button" className="secondary" onClick={()=>setDeclaracao({tipo:'menu',detail:declaracao.detail})}>Voltar</button><button type="button" onClick={()=>{if(!declaracao.titular?.nome||!declaracao.titular?.cpf){alert('Informe o nome e o CPF do titular do endereço.');return}setDeclaracao(prev=>({...prev,tipo:'titular'}))}}>Continuar</button></div>
</section>}

{['inexistencia','titular','dsa'].includes(declaracao.tipo)&&<section className="modal declarationModal">
  <div className="modalhead noPrint"><div><h2>Declaração</h2><p>Pré-visualização para impressão</p></div><button type="button" className="close" onClick={()=>setDeclaracao(null)}>×</button></div>
  <div className="declarationPaper printDeclaration">
    {declaracao.tipo==='inexistencia'&&<>
      <h1>DECLARAÇÃO DE INEXISTÊNCIA DE INQUÉRITOS POLICIAIS OU<br/>PROCESSOS CRIMINAIS</h1>
      <p>Eu, <strong>{nomeCliente(declaracao.detail)}</strong>, BRASILEIRO, natural de <strong>{String(declaracao.detail.naturalidade||'').toUpperCase()}</strong>, nascido em <strong>{getNascimento(declaracao.detail)||'NÃO INFORMADO'}</strong>, filho(a) de <strong>{String(declaracao.detail.filiacao_pai||'').toUpperCase()}</strong> e <strong>{String(declaracao.detail.filiacao_mae||'').toUpperCase()}</strong>, <strong>{String(declaracao.detail.estado_civil||'').toUpperCase()}</strong> residência no(a), <strong>{[declaracao.detail.endereco,declaracao.detail.numero,declaracao.detail.complemento,declaracao.detail.bairro].filter(Boolean).join(', ')}</strong>, CEP <strong>{declaracao.detail.cep||''}</strong>, {String(declaracao.detail.cidade||'').toUpperCase()} - {String(declaracao.detail.estado||'').toUpperCase()} RG nº <strong>{declaracao.detail.rg||''}</strong>, declaro, sob as penas da lei, que não respondo a inquéritos policiais nem a processos criminais no estado de domicílio e nos entes federativos, e estou ciente de que, em caso de falsidade ideológica, ficarei sujeito às sanções prescritas no Código Penal e às demais cominações legais aplicáveis.</p>
      <p className="art">Art. 299 - Omitir, em documento público ou particular, declaração que nele deveria constar, ou nele inserir ou fazer inserir declaração falsa ou diversa da que devia ser escrita, com o fim de prejudicar direito, criar obrigação ou alterar a verdade sobre o fato juridicamente relevante.</p>
      <p>Pena - reclusão de 1 (um) a 5 (cinco) anos e multa, se o documento é público e reclusão de 1 (um) a 3 (três) anos, se o documento é particular.</p>
      <p className="validade">Esta declaração tem validade até a data: 20/12/2026</p>
      <p className="local">Salvador- BA, 21 de setembro de 2026</p>
      <p className="assinatura"><strong>{nomeCliente(declaracao.detail)}</strong></p>
      <p className="cpf">CPF Nº {declaracao.detail.cpf_cnpj||''}</p>
    </>}

    {declaracao.tipo==='titular'&&<>
      <h1>DECLARAÇÃO DO TITULAR DO ENDEREÇO</h1>
      <p>Eu <strong>{String(declaracao.titular.nome||'').toUpperCase()}</strong>, RG nº {declaracao.titular.rg||''}, CPF nº {declaracao.titular.cpf||''}, declaro para os devidos fins que o senhor(a) <strong>{nomeCliente(declaracao.detail)}</strong> RG nº {declaracao.detail.rg||''}, portador do CPF nº {declaracao.detail.cpf_cnpj||''}, <strong>reside no endereço de minha propriedade</strong> localizado no (a) , {enderecoCliente(declaracao.detail)}, CEP {declaracao.detail.cep||''}, {cidadeEstadoCliente(declaracao.detail)} e <strong>está autorizado a guardar seu acervo de PCE no respectivo endereço.</strong> <strong>Tenho ciência de que o local será usado para armazenamento de armas, munições e acessórios autorizados pelo Exército Brasileiro/Polícia Federal.</strong></p>
      <p>Por ser verdade, dato e assino o presente documento, declarando estar ciente de que responderei criminalmente em caso de falsidade das informações aqui prestadas.</p>
      <p className="titularAssinatura">{String(declaracao.titular.nome||'').toUpperCase()}<br/>{declaracao.titular.cpf||''}</p>
      <p className="titularData">21 de setembro de 2026</p>
    </>}

    {declaracao.tipo==='dsa'&&<>
      <h1>DECLARAÇÃO DE SEGURANÇA DO ACERVO (DSA)</h1>
      <p>Eu, <strong>{nomeCliente(declaracao.detail)}</strong>, nascido em {getNascimento(declaracao.detail)||'NÃO INFORMADO'}, filho(a) de {String(declaracao.detail.filiacao_pai||'').toUpperCase()} e {String(declaracao.detail.filiacao_mae||'').toUpperCase()} RG nº {declaracao.detail.rg||''}{declaracao.detail.rg_orgao ? ' - '+declaracao.detail.rg_orgao : ''}, BRASILEIRO, natural de {String(declaracao.detail.naturalidade||'').toUpperCase()}, portador do CPF nº {declaracao.detail.cpf_cnpj||''} residência no(a), {declaracao.detail.endereco||''}, {declaracao.detail.numero||''}, {declaracao.detail.complemento||''}, {declaracao.detail.bairro||''}, CEP {declaracao.detail.cep||''}, {cidadeEstadoCliente(declaracao.detail)}.</p>
      <p><strong>DECLARO</strong>, para fim de <strong>renovação</strong> de Certificado de Registro Arma de Fogo, na categoria pessoa física , que meu acervo/PCE será sempre mantido em local seguro.</p>
      <p className="validade dsaValidade">Esta declaração tem validade até a data: <strong>20/12/2026</strong></p>
      <p className="local dsaLocal">{cidadeEstadoCliente(declaracao.detail)}, 21 de setembro de 2026</p>
      <p className="assinatura dsaAssinatura"><strong>{nomeCliente(declaracao.detail)}</strong><br/>CPF Nº {declaracao.detail.cpf_cnpj||''}</p>
    </>}
  </div>
  <div className="actions noPrint"><button type="button" className="secondary" onClick={()=>setDeclaracao({tipo:'menu',detail:declaracao.detail})}>Voltar</button><button type="button" onClick={()=>window.print()}>Imprimir / Salvar PDF</button></div>
</section>}
</div>{show&&<div className="overlay"><section className="modal"><div className="modalhead"><div><h2>{editing?'Editar cliente':'Novo cliente'}</h2><p>Cadastro completo do cliente</p></div><button className="close" onClick={()=>{setShow(false);setEditing(false)}}>×</button></div><form onSubmit={save}>
<h3>1. Identificação</h3><div className="grid"><F label="Código" name="codigo" form={form} setForm={setForm}/><F label="Nome completo / Razão social" name="nome_completo" required form={form} setForm={setForm}/><F label="CPF/CNPJ" name="cpf_cnpj" required form={form} setForm={setForm}/><F label="Data de nascimento / fundação" name="nascimento" type="date" form={form} setForm={setForm}/><F label="Naturalidade" name="naturalidade" form={form} setForm={setForm}/><F label="Filiação - Pai" name="filiacao_pai" form={form} setForm={setForm}/><F label="Filiação - Mãe" name="filiacao_mae" form={form} setForm={setForm}/><F label="Estado civil" name="estado_civil" form={form} setForm={setForm}/><F label="RG" name="rg" form={form} setForm={setForm}/><F label="Órgão RG" name="rg_orgao" form={form} setForm={setForm}/><label><span>Tipo de cliente</span><select value={form.tipo_cliente} onChange={e=>setForm({...form,tipo_cliente:e.target.value})}><option>Pessoa Física</option><option>Pessoa Jurídica</option></select></label><label><span>Status</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="bloqueado">Bloqueado</option></select></label></div>
<h3>2. Contatos</h3><div className="grid"><F label="Telefone" name="telefone" form={form} setForm={setForm}/><F label="WhatsApp" name="whatsapp" form={form} setForm={setForm}/><F label="E-mail" name="email" form={form} setForm={setForm}/></div>
<h3>3. Endereço</h3><div className="grid"><F label="CEP" name="cep" form={form} setForm={setForm}/><F label="Endereço" name="endereco" form={form} setForm={setForm}/><F label="Número" name="numero" form={form} setForm={setForm}/><F label="Complemento" name="complemento" form={form} setForm={setForm}/><F label="Bairro" name="bairro" form={form} setForm={setForm}/><F label="Cidade" name="cidade" form={form} setForm={setForm}/><F label="Estado" name="estado" form={form} setForm={setForm}/></div>
<h3>4. Gestão do cadastro</h3><div className="grid"><F label="Origem do cadastro" name="origem_cadastro" form={form} setForm={setForm}/><F label="Responsável" name="responsavel" form={form} setForm={setForm}/></div>
<h3>5. Perfil CAC</h3><div className="grid"><F label="Categoria CAC" name="categoria_cac" form={form} setForm={setForm}/><F label="Número do CR" name="cr_numero" form={form} setForm={setForm}/><F label="Emissão do CR" name="cr_emissao" type="date" form={form} setForm={setForm}/><F label="Validade do CR" name="cr_validade" type="date" form={form} setForm={setForm}/><label><span>Situação do CR</span><select value={form.cr_situacao} onChange={e=>setForm({...form,cr_situacao:e.target.value})}><option value="">Selecione</option><option>Regular</option><option>Próximo do vencimento</option><option>Vencido</option><option>Em análise</option></select></label><F label="Órgão emissor" name="cr_orgao" form={form} setForm={setForm}/></div>
<h3>6. Observações</h3><textarea rows="4" value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})} placeholder="Informações relevantes sobre o cliente..."/>
{erro&&<div className="msg error">{erro}</div>}{ok&&<div className="msg success">{ok}</div>}<div className="actions"><button type="button" className="secondary" onClick={()=>{setShow(false);setEditing(false)}}>Cancelar</button><button type="submit">{editing?'Salvar alterações':'Salvar cliente'}</button></div></form></section></div>}</main>}
createRoot(document.getElementById('root')).render(<App/>);