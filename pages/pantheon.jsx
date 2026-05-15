// Pantheon page + editor UI

const S_pan = {
  btnPrimary: { padding:'10px 22px', background:'transparent', border:'1px solid var(--gold-dim)', color:'var(--gold-bright)', fontFamily:'Cinzel, serif', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 },
  overlay: { position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.78)', display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'60px 20px 40px' },
  modal: { background:'var(--bg-page)', border:'1px solid var(--gold-dim)', borderRadius:4, padding:'44px 48px', width:'100%', maxWidth:640 },
  field: { display:'flex', flexDirection:'column', gap:7 },
  label: { fontFamily:'JetBrains Mono', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--foam-dim)' },
  input: { padding:'10px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--ink-line)', borderRadius:2, color:'var(--parchment)', fontFamily:'EB Garamond, serif', fontSize:15, outline:'none' },
  textarea: { padding:'10px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--ink-line)', borderRadius:2, color:'var(--parchment)', fontFamily:'EB Garamond, serif', fontSize:15, outline:'none', resize:'vertical', minHeight:80, lineHeight:1.6 },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  select: { padding:'10px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--ink-line)', borderRadius:2, color:'var(--parchment)', fontFamily:'EB Garamond, serif', fontSize:15, outline:'none' },
};

const SIGIL_OPTIONS = ['Tome','Dragon','Sun','Raven','Crown','Chain','Hand','Bookmark','Dawn','Compass','Ornament','Settings'];

function DeityFormModal({ onClose, onSaved }) {
  const [form, setForm] = React.useState({ id:'', name:'', epithet:'', sigil:'Tome', tier:'pantheon', domain:'', alignment:'', aligned:false, opposed:false });
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function handleSave() {
    if (!form.id || !form.name) { setError('ID e nome são obrigatórios.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, id: form.id.toLowerCase().replace(/\s+/g,'-'), hero_text:'', infobox:{}, sections:[], related:[], placeholder:true };
      await DB.saveDeity(payload);
      window.Entities.deities[payload.id] = payload;
      onSaved(payload);
    } catch(e) { setError('Erro ao salvar: ' + e.message); }
    setSaving(false);
  }

  return (
    <div style={S_pan.overlay} onClick={onClose}>
      <div style={S_pan.modal} onClick={e=>e.stopPropagation()}>
        <h2 style={{fontFamily:'Cinzel,serif',fontSize:20,fontWeight:400,color:'var(--parchment)',margin:'0 0 32px'}}>Nova Divindade</h2>
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <div style={S_pan.grid2}>
            <div style={S_pan.field}>
              <label style={S_pan.label}>ID (slug único) *</label>
              <input style={S_pan.input} value={form.id} onChange={e=>set('id',e.target.value)} placeholder="bahamut" />
            </div>
            <div style={S_pan.field}>
              <label style={S_pan.label}>Tier</label>
              <select style={S_pan.select} value={form.tier} onChange={e=>set('tier',e.target.value)}>
                <option value="titan">Titã</option>
                <option value="pantheon">Panteão</option>
                <option value="ascended">Ascendido</option>
              </select>
            </div>
          </div>
          <div style={S_pan.field}>
            <label style={S_pan.label}>Nome *</label>
            <input style={S_pan.input} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Novo Deus" />
          </div>
          <div style={S_pan.field}>
            <label style={S_pan.label}>Epíteto</label>
            <input style={S_pan.input} value={form.epithet} onChange={e=>set('epithet',e.target.value)} placeholder="O que Ninguém Viu" />
          </div>
          <div style={S_pan.grid2}>
            <div style={S_pan.field}>
              <label style={S_pan.label}>Domínio</label>
              <input style={S_pan.input} value={form.domain} onChange={e=>set('domain',e.target.value)} placeholder="Fogo, Criação" />
            </div>
            <div style={S_pan.field}>
              <label style={S_pan.label}>Alinhamento</label>
              <input style={S_pan.input} value={form.alignment} onChange={e=>set('alignment',e.target.value)} placeholder="Leal-Bom" />
            </div>
          </div>
          <div style={S_pan.field}>
            <label style={S_pan.label}>Ícone / Sigil</label>
            <select style={S_pan.select} value={form.sigil} onChange={e=>set('sigil',e.target.value)}>
              {SIGIL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{display:'flex',gap:24}}>
            <label style={{...S_pan.label,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
              <input type="checkbox" checked={form.aligned} onChange={e=>set('aligned',e.target.checked)} />
              Aliado dos heróis
            </label>
            <label style={{...S_pan.label,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
              <input type="checkbox" checked={form.opposed} onChange={e=>set('opposed',e.target.checked)} />
              Oposto / hostil
            </label>
          </div>

          {error && <div style={{color:'#c84b4b',fontFamily:'JetBrains Mono',fontSize:10}}>{error}</div>}
          <div style={{display:'flex',gap:12,justifyContent:'flex-end',paddingTop:8}}>
            <button onClick={onClose} style={{...S_pan.btnPrimary,opacity:0.5}}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{...S_pan.btnPrimary,opacity:saving?0.6:1}}>
              {saving?'Salvando...':'Adicionar ao panteão'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pantheon({ onNav }) {
  const { isEditor } = useAuth();
  const [pantheon, setPantheon] = React.useState(window.Data.pantheon || []);
  const [showForm, setShowForm] = React.useState(false);

  function handleSaved(deity) {
    const TIER_LABELS = { titan:'Os Titãs', pantheon:'Deuses do Panteão', ascended:'Ascendidos' };
    const TIER_DESCS  = { titan:'As divindades primordiais.', pantheon:'As divindades estabelecidas.', ascended:'Mortais elevados ao manto divino.' };
    setPantheon(prev => {
      const tierLabel = TIER_LABELS[deity.tier];
      const existing  = prev.find(t => t.tier === tierLabel);
      if (existing) return prev.map(t => t.tier === tierLabel ? { ...t, gods: [...t.gods, deity] } : t);
      return [...prev, { tier: tierLabel, tierDesc: TIER_DESCS[deity.tier], gods: [deity] }];
    });
    setShowForm(false);
  }

  return (
    <div className="pantheon" data-screen-label="02 Panteão">
      <header className="page-header">
        <div className="page-eyebrow">Cosmologia · Volume II · Os Deuses</div>
        <h1 className="page-title">O Panteão de Valiran</h1>
        <p className="page-lede">
          Em Valiran, os deuses não são metáforas. Caminham, sangram, e às vezes são presos.
        </p>
      </header>

      {isEditor && (
        <div style={{display:'flex',justifyContent:'flex-end',padding:'0 0 28px'}}>
          <button style={S_pan.btnPrimary} onClick={() => setShowForm(true)}>+ Nova divindade</button>
        </div>
      )}

      {pantheon.map((tier, ti) => (
        <section key={tier.tier} className="pantheon-tier">
          <div className="tier-header">
            <span className="tier-num">{String(ti+1).padStart(2,'0')} / {String(pantheon.length).padStart(2,'0')}</span>
            <h2 className="tier-name">{tier.tier}</h2>
            <p className="tier-desc">{tier.tierDesc}</p>
          </div>
          <div className="deity-grid">
            {tier.gods.map(g => {
              const Icon = Sigil[g.sigil];
              const slug = (g.name||'').toLowerCase().replace(/[áàâã]/g,'a').replace(/[éê]/g,'e').replace(/[íî]/g,'i').replace(/[óô]/g,'o').replace(/[úû]/g,'u').replace(/ç/g,'c').replace(/[^a-z0-9]/g,'');
              return (
                <article key={g.name} className="deity" onClick={() => onNav('deity:' + (g.id || slug))}>
                  <div className="deity-sigil">{Icon && <Icon style={{width:'100%',height:'100%'}} />}</div>
                  <h3 className="deity-name">{g.name}</h3>
                  <p className="deity-epithet">{g.epithet}</p>
                  <div className="deity-meta">
                    <span className={g.aligned?'aligned':g.opposed?'opposed':''}>{g.domain}</span>
                    <span>{g.alignment}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <div style={{marginTop:80,padding:'32px 0',borderTop:'1px solid var(--ink-line-soft)',textAlign:'center',fontFamily:'EB Garamond, serif',fontStyle:'italic',color:'var(--foam-dim)',fontSize:15}}>
        "Conta-se que existem outros. Aqueles cujos nomes foram apagados pelos próprios crentes."
        <div style={{marginTop:8,fontSize:11,fontStyle:'normal',letterSpacing:'0.22em',fontFamily:'JetBrains Mono'}}>— ARQUIVISTA CAEL</div>
      </div>

      {showForm && <DeityFormModal onClose={() => setShowForm(false)} onSaved={handleSaved} />}
    </div>
  );
}

window.Pantheon = Pantheon;
