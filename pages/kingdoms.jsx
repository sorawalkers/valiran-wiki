// Kingdoms — encyclopedia cards + editor UI

function KingdomAddModal({ onClose }) {
  const [form, setForm] = React.useState({ name:'', type:'', capital:'', leader:'', population:'', alignment:'', description:'' });
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const S = { input:{padding:'10px 13px',background:'rgba(255,255,255,0.04)',border:'1px solid var(--ink-line)',borderRadius:2,color:'var(--parchment)',fontFamily:'EB Garamond,serif',fontSize:15,outline:'none'}, label:{fontFamily:'JetBrains Mono',fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--foam-dim)'}, field:{display:'flex',flexDirection:'column',gap:7} };

  async function handleSave() {
    if (!form.name) { setError('Nome é obrigatório.'); return; }
    setSaving(true);
    try {
      const id = form.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
      await sb.from('kingdoms').upsert({ id, ...form, stats: [] }, { onConflict:'id' });
      onClose(true);
    } catch(e) { setError('Erro: '+e.message); setSaving(false); }
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:9000,background:'rgba(0,0,0,0.78)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>onClose(false)}>
      <div style={{background:'var(--bg-page)',border:'1px solid var(--gold-dim)',borderRadius:4,padding:'44px 48px',width:520,maxWidth:'90vw'}} onClick={e=>e.stopPropagation()}>
        <h2 style={{fontFamily:'Cinzel,serif',fontSize:18,fontWeight:400,color:'var(--parchment)',margin:'0 0 28px'}}>Novo Reino / Potência</h2>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={S.field}><label style={S.label}>Nome *</label><input style={S.input} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Reino de Valinar" /></div>
            <div style={S.field}><label style={S.label}>Tipo</label><input style={S.input} value={form.type} onChange={e=>set('type',e.target.value)} placeholder="Monarquia, República..." /></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={S.field}><label style={S.label}>Capital</label><input style={S.input} value={form.capital} onChange={e=>set('capital',e.target.value)} placeholder="Cidade capital" /></div>
            <div style={S.field}><label style={S.label}>Liderança</label><input style={S.input} value={form.leader} onChange={e=>set('leader',e.target.value)} placeholder="Rei/Rainha/Conselho" /></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={S.field}><label style={S.label}>População estimada</label><input style={S.input} value={form.population} onChange={e=>set('population',e.target.value)} placeholder="≈ 2.8M almas" /></div>
            <div style={S.field}><label style={S.label}>Alinhamento</label><input style={S.input} value={form.alignment} onChange={e=>set('alignment',e.target.value)} placeholder="Leal-Bom, Neutro..." /></div>
          </div>
          <div style={S.field}><label style={S.label}>Descrição</label><textarea style={{...S.input,resize:'vertical',minHeight:70,lineHeight:1.6}} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Breve descrição do reino..." /></div>
          {error && <div style={{color:'#c84b4b',fontFamily:'JetBrains Mono',fontSize:10}}>{error}</div>}
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button onClick={()=>onClose(false)} style={{padding:'9px 18px',background:'transparent',border:'1px solid var(--ink-line)',color:'var(--foam-dim)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2}}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{padding:'9px 18px',background:'transparent',border:'1px solid var(--gold-dim)',color:'var(--gold-bright)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2,opacity:saving?0.6:1}}>{saving?'Salvando...':'Criar reino'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kingdoms({ onNav }) {
  const { isEditor } = useAuth();
  const [showAdd, setShowAdd] = React.useState(false);
  const list = [
    { sigil:'Crown',  eyebrow:'Monarquia · expansionista', name:'Reino de Oshain', motto:'"Sob a chama, todo o mundo é casa."', desc:'Liderado há mais de um século pela Rainha Annabella Whiteflame, Oshain triplicou seu território. A organização Blackflame, oficialmente inexistente, parece sempre presente em cada anexação.', stats:[{k:'Capital',v:'Halensgard'},{k:'Liderança',v:'Rainha Annabella'},{k:'População',v:'≈ 4.2M'},{k:'Alinhamento',v:'Tirânico',danger:true}], target:'map' },
    { sigil:'Dragon', eyebrow:'República dracônica', name:'República Prateada', motto:'"Justiça é a lei que vale para todos — inclusive os dragões."', desc:'Fundada em 2ªE 023 por Bahamut em forma encarnada, a República é o único bastião real de justiça em Valiran. Abriga dissidentes, reúne heróis, e mantém uma cadeira vazia para o deus fundador.', stats:[{k:'Capital',v:'Aerithys'},{k:'Liderança',v:'Conselho dos Dez'},{k:'População',v:'≈ 2.8M'},{k:'Alinhamento',v:'Leal-Bom'}], target:'map' },
    { sigil:'Tome',   eyebrow:'Magocracia', name:'Lorean Treaz', motto:'"Conhecimento é soberania. Ignorância é servidão."', desc:'A magocracia governa via concílio de arquimagos. Pioneira nos Warforged, possui a maior biblioteca do continente e um tratado não escrito de não-agressão com todos os planos que ela mesma mapeou.', stats:[{k:'Capital',v:'A Torre Plúrima'},{k:'Liderança',v:'Concílio Magisterial'},{k:'População',v:'≈ 1.6M'},{k:'Alinhamento',v:'Neutro'}], target:'map' },
    { sigil:'Crown',  eyebrow:'Império militar · isolacionista', name:'Império de Ferro', motto:'"Aço não pede permissão."', desc:'Cortaram sua conexão com a Trama séculos atrás. Imunes ao arcano, vivem em isolamento marcial — o único reino do continente onde um mago é tratado como estrangeiro suspeito.', stats:[{k:'Capital',v:'Tor Klain'},{k:'Liderança',v:'Imperador Korvath VII'},{k:'População',v:'≈ 3.0M'},{k:'Alinhamento',v:'Leal-Neutro'}] },
    { sigil:'Raven',  eyebrow:'Ruínas ocupadas · corrompidas', name:'Nova Lancaster', motto:'"(Sem motto oficial — Oshain proibiu)"', desc:'O reino sagrado caiu em 1276. Oshain anexou as ruínas e renomeou. O Selo da Tumba dos Hereges está rompido. A corrupção se alastra. O antigo clero de Esmir, disperso, se nega a chamar de "Nova" algo que ainda reconhece pelo cheiro.', stats:[{k:'Antigo nome',v:'Lancaster'},{k:'Caiu em',v:'3ªE 1276'},{k:'Ocupada por',v:'Oshain'},{k:'Estado',v:'Corrompida',danger:true}] },
  ];

  return (
    <div className="page" data-screen-label="09 Reinos & Potências">
      <header className="page-header">
        <div className="page-eyebrow">Geopolítica · Vol. V · O Tabuleiro</div>
        <h1 className="page-title">Reinos & Potências</h1>
        <p className="page-lede">Cinco poderes disputam Valiran. Três têm exércitos. Dois têm segredos piores do que exércitos.</p>
      </header>

      {isEditor && (
        <div style={{display:'flex',justifyContent:'flex-end',padding:'0 0 24px'}}>
          <button style={{padding:'10px 22px',background:'transparent',border:'1px solid var(--gold-dim)',color:'var(--gold-bright)',fontFamily:'Cinzel,serif',fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2}} onClick={()=>setShowAdd(true)}>+ Novo reino</button>
        </div>
      )}

      <div className="kingdom-grid">
        {list.map(k => {
          const Icon = Sigil[k.sigil];
          return (
            <article key={k.name} className="kingdom-card" onClick={k.target ? ()=>onNav(k.target) : undefined}>
              <div className="kingdom-head">
                <div className="kingdom-sigil">{Icon && <Icon style={{width:'100%',height:'100%'}} />}</div>
                <div>
                  <div className="kingdom-eyebrow">{k.eyebrow}</div>
                  <h2 className="kingdom-name">{k.name}</h2>
                  <p className="kingdom-motto">{k.motto}</p>
                </div>
              </div>
              <p className="kingdom-desc">{k.desc}</p>
              <dl className="kingdom-stats">
                {k.stats.map(s => (
                  <div key={s.k} className="kingdom-stat">
                    <dt>{s.k}</dt>
                    <dd className={s.danger?'danger':''}>{s.v}</dd>
                  </div>
                ))}
              </dl>
              {k.target && <div className="kingdom-cta">Ver no mapa →</div>}
            </article>
          );
        })}
      </div>

      {showAdd && <KingdomAddModal onClose={(saved)=>{ if(saved) setShowAdd(false); else setShowAdd(false); }} />}
    </div>
  );
}

window.Kingdoms = Kingdoms;
