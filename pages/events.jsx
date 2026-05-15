// Events — filterable list + editor UI

function EventAddModal({ onClose }) {
  const [form, setForm] = React.useState({ year:'', cat:'pol', title:'', desc:'', region:'' });
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inSt = {padding:'10px 13px',background:'rgba(255,255,255,0.04)',border:'1px solid var(--ink-line)',borderRadius:2,color:'var(--parchment)',fontFamily:'EB Garamond,serif',fontSize:15,outline:'none'};
  const lbSt = {fontFamily:'JetBrains Mono',fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--foam-dim)'};

  async function handleSave() {
    if (!form.title) { setError('Título é obrigatório.'); return; }
    setSaving(true);
    try {
      const catLabel = {pol:'Político',div:'Divino',arc:'Arcano',cata:'Catástrofe'}[form.cat] || form.cat;
      await sb.from('events').insert({ title:form.title, year:form.year, category:catLabel, region:form.region, description:form.desc, sort_order:Date.now() });
      onClose(true);
    } catch(e) { setError('Erro: '+e.message); setSaving(false); }
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:9000,background:'rgba(0,0,0,0.78)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>onClose(false)}>
      <div style={{background:'var(--bg-page)',border:'1px solid var(--gold-dim)',borderRadius:4,padding:'44px 48px',width:540,maxWidth:'90vw'}} onClick={e=>e.stopPropagation()}>
        <h2 style={{fontFamily:'Cinzel,serif',fontSize:18,fontWeight:400,color:'var(--parchment)',margin:'0 0 28px'}}>Novo Evento da Era</h2>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={{display:'flex',flexDirection:'column',gap:7}}><label style={lbSt}>Ano / Era</label><input style={inSt} value={form.year} onChange={e=>set('year',e.target.value)} placeholder="3ªE 1281" /></div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}><label style={lbSt}>Categoria</label>
              <select style={inSt} value={form.cat} onChange={e=>set('cat',e.target.value)}>
                <option value="pol">Político</option>
                <option value="div">Divino</option>
                <option value="arc">Arcano</option>
                <option value="cata">Catástrofe</option>
              </select>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}><label style={lbSt}>Título *</label><input style={inSt} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="O nome do evento" /></div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}><label style={lbSt}>Descrição</label><textarea style={{...inSt,resize:'vertical',minHeight:70,lineHeight:1.6}} value={form.desc} onChange={e=>set('desc',e.target.value)} placeholder="O que aconteceu, brevemente." /></div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}><label style={lbSt}>Região</label><input style={inSt} value={form.region} onChange={e=>set('region',e.target.value)} placeholder="Lancaster, Aerithys..." /></div>
          {error && <div style={{color:'#c84b4b',fontFamily:'JetBrains Mono',fontSize:10}}>{error}</div>}
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button onClick={()=>onClose(false)} style={{padding:'9px 18px',background:'transparent',border:'1px solid var(--ink-line)',color:'var(--foam-dim)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2}}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{padding:'9px 18px',background:'transparent',border:'1px solid var(--gold-dim)',color:'var(--gold-bright)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2,opacity:saving?0.6:1}}>{saving?'Salvando...':'Registrar evento'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Events({ onNav }) {
  const { isEditor } = useAuth();
  const [filter, setFilter] = React.useState('todos');
  const [showAdd, setShowAdd] = React.useState(false);

  const events = [
    { year:'T-???',    cat:'div',  catLabel:'Divino',     title:'Cerigane tece a Trama',          desc:'O primeiro ato consciente do mundo.',                                               region:'Pré-Valiran' },
    { year:'1ªE 489',  cat:'div',  catLabel:'Divino',     title:'Esmir ascende',                  desc:'Um mortal compra com sua morte a era seguinte.',                                    region:'Lancaster' },
    { year:'2ªE 023',  cat:'pol',  catLabel:'Político',   title:'República Prateada é fundada',   desc:'Dragões metálicos pousam sobre o continente sul.',                                  region:'Aerithys' },
    { year:'2ªE 314',  cat:'arc',  catLabel:'Arcano',     title:'Primeiro Warforged desperta',    desc:'Ven Sothiel transfere uma consciência para o aço.',                                 region:'Lorean Treaz' },
    { year:'2ªE 798',  cat:'pol',  catLabel:'Político',   title:'Annabella é coroada',            desc:'Uma rainha jovem que jamais envelheceu um dia.',                                    region:'Oshain' },
    { year:'3ªE 1276', cat:'cata', catLabel:'Catástrofe', title:'A Queda de Lancaster',           desc:'O selo é rompido. O reino sagrado cai em uma noite.',                              region:'Lancaster', target:'article' },
    { year:'3ªE 1276', cat:'div',  catLabel:'Divino',     title:'Vaglies Lihleran I se sacrifica',desc:'O Rei oferece a própria vida para retardar a fenda.',                               region:'Lancaster' },
    { year:'3ªE 1278', cat:'pol',  catLabel:'Político',   title:'Blackflame parcialmente revelada',desc:'Documentos vazam. Oshain mente sobre vinte coisas em vez de uma.',                region:'Halensgard' },
    { year:'3ªE 1279', cat:'cata', catLabel:'Catástrofe', title:'Mortvuus se mexe',              desc:'Pela primeira vez em milênios, o Silêncio Primeiro fala. Ninguém entendeu.',        region:'Indeterminado' },
    { year:'3ªE 1280', cat:'arc',  catLabel:'Arcano',     title:'A décima primeira ruptura',     desc:'O Concílio mapeia mais uma cicatriz na Trama. A perícia chora discretamente.',      region:'Lorean Treaz' },
    { year:'3ªE 1281', cat:'pol',  catLabel:'Político',   title:'A campanha começa',             desc:'Sete heróis improváveis se cruzam numa estalagem.',                                 region:'Tarvane', target:'sessions' },
  ];

  const filters = [
    { id:'todos', label:'Todos' },
    { id:'pol',   label:'Político' },
    { id:'div',   label:'Divino' },
    { id:'arc',   label:'Arcano' },
    { id:'cata',  label:'Catástrofe' },
  ];

  const visible = filter === 'todos' ? events : events.filter(e => e.cat === filter);

  return (
    <div className="page" data-screen-label="11 Eventos da Era">
      <header className="page-header">
        <div className="page-eyebrow">Arquivo · Vol. VI · Crônicas da Era</div>
        <h1 className="page-title">Eventos da Era</h1>
        <p className="page-lede">O que mudou o mundo — por categoria, por era, por consequência.</p>
      </header>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28,flexWrap:'wrap',gap:12}}>
        <div className="event-filters">
          {filters.map(f => (
            <button key={f.id} className={'event-filter-btn'+(filter===f.id?' active':'')} onClick={()=>setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        {isEditor && (
          <button style={{padding:'9px 18px',background:'transparent',border:'1px solid var(--gold-dim)',color:'var(--gold-bright)',fontFamily:'Cinzel,serif',fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2}} onClick={()=>setShowAdd(true)}>+ Novo evento</button>
        )}
      </div>

      <div className="event-list">
        {visible.map((e,i) => (
          <div key={i} className={'event-row '+(e.cat==='cata'?'catastrophe':e.cat==='div'?'divine':'')} onClick={e.target?()=>onNav(e.target):undefined} style={e.target?{cursor:'pointer'}:{}}>
            <div className="event-year">{e.year}</div>
            <div className="event-body">
              <div className="event-cat-tag">{e.catLabel}</div>
              <h3 className="event-title">{e.title}</h3>
              <p className="event-desc">{e.desc}</p>
              <span className="event-region">↳ {e.region}</span>
            </div>
            {e.target && <div className="event-cta">→</div>}
          </div>
        ))}
      </div>

      {showAdd && <EventAddModal onClose={(saved)=>setShowAdd(false)} />}
    </div>
  );
}

window.Events = Events;
