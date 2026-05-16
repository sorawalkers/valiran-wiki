// Timeline — chronological events + editor UI

const S_tl = {
  btnPrimary: { padding:'10px 22px', background:'transparent', border:'1px solid var(--gold-dim)', color:'var(--gold-bright)', fontFamily:'Cinzel, serif', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 },
  overlay: { position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.78)', display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'60px 20px 40px' },
  modal: { background:'var(--bg-page)', border:'1px solid var(--gold-dim)', borderRadius:4, padding:'44px 48px', width:'100%', maxWidth:600 },
  field: { display:'flex', flexDirection:'column', gap:7 },
  label: { fontFamily:'JetBrains Mono', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--foam-dim)' },
  input: { padding:'10px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--ink-line)', borderRadius:2, color:'var(--parchment)', fontFamily:'EB Garamond, serif', fontSize:15, outline:'none' },
  textarea: { padding:'10px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--ink-line)', borderRadius:2, color:'var(--parchment)', fontFamily:'EB Garamond, serif', fontSize:15, outline:'none', resize:'vertical', minHeight:80, lineHeight:1.6 },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  select: { padding:'10px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--ink-line)', borderRadius:2, color:'var(--parchment)', fontFamily:'EB Garamond, serif', fontSize:15, outline:'none' },
};

function TimelineEventModal({ onClose, onSaved }) {
  const [form, setForm] = React.useState({ year:'', label:'', title:'', desc:'', tag:'', kind:'' });
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function handleSave() {
    if (!form.title) { setError('Título é obrigatório.'); return; }
    setSaving(true); setError('');
    try {
      await DB.saveTimelineEvent({ ...form, sort_order: Date.now() });
      onSaved({ ...form });
    } catch(e) { setError('Erro ao salvar: ' + e.message); }
    setSaving(false);
  }

  return (
    <div style={S_tl.overlay} onClick={onClose}>
      <div style={S_tl.modal} onClick={e=>e.stopPropagation()}>
        <h2 style={{fontFamily:'Cinzel,serif',fontSize:20,fontWeight:400,color:'var(--parchment)',margin:'0 0 32px'}}>Novo Evento</h2>
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <div style={S_tl.grid2}>
            <div style={S_tl.field}>
              <label style={S_tl.label}>Ano / Era</label>
              <input style={S_tl.input} value={form.year} onChange={e=>set('year',e.target.value)} placeholder="3ªE 1281" />
            </div>
            <div style={S_tl.field}>
              <label style={S_tl.label}>Etiqueta</label>
              <input style={S_tl.input} value={form.label} onChange={e=>set('label',e.target.value)} placeholder="Catástrofe" />
            </div>
          </div>
          <div style={S_tl.field}>
            <label style={S_tl.label}>Título *</label>
            <input style={S_tl.input} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="A Queda de Algum Lugar" />
          </div>
          <div style={S_tl.field}>
            <label style={S_tl.label}>Descrição</label>
            <textarea style={S_tl.textarea} value={form.desc} onChange={e=>set('desc',e.target.value)} placeholder="O que aconteceu, em detalhes." />
          </div>
          <div style={S_tl.grid2}>
            <div style={S_tl.field}>
              <label style={S_tl.label}>Tag de categoria</label>
              <input style={S_tl.input} value={form.tag} onChange={e=>set('tag',e.target.value)} placeholder="Política, Divino, Arcano..." />
            </div>
            <div style={S_tl.field}>
              <label style={S_tl.label}>Tipo visual</label>
              <select style={S_tl.select} value={form.kind} onChange={e=>set('kind',e.target.value)}>
                <option value="">Normal</option>
                <option value="divine">Divino (dourado)</option>
                <option value="catastrophe">Catástrofe (vermelho)</option>
              </select>
            </div>
          </div>

          {error && <div style={{color:'#c84b4b',fontFamily:'JetBrains Mono',fontSize:10}}>{error}</div>}
          <div style={{display:'flex',gap:12,justifyContent:'flex-end',paddingTop:8}}>
            <button onClick={onClose} style={{...S_tl.btnPrimary,opacity:0.5}}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{...S_tl.btnPrimary,opacity:saving?0.6:1}}>
              {saving?'Salvando...':'Salvar evento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Timeline({ onNav }) {
  const { isEditor } = useAuth();
  const [events, setEvents]       = React.useState(window.Data.timeline || []);
  const [showForm, setShowForm]   = React.useState(false);
  const [confirmIdx, setConfirmIdx] = React.useState(null);
  const [deletingIdx, setDeletingIdx] = React.useState(null);

  function handleSaved(ev) {
    setEvents(prev => [...prev, ev]);
    setShowForm(false);
  }

  async function handleDelete(i, ev) {
    if (confirmIdx !== i) { setConfirmIdx(i); return; }
    setDeletingIdx(i);
    try {
      if (ev.id) await DB.deleteTimelineEvent(ev.id);
      setEvents(prev => prev.filter((_, idx) => idx !== i));
    } catch(e) { console.error(e); }
    setDeletingIdx(null);
    setConfirmIdx(null);
  }

  return (
    <div className="page" data-screen-label="04 Linha do Tempo">
      <header className="page-header">
        <div className="page-eyebrow">Cronologia · Vol. I · Do Princípio</div>
        <h1 className="page-title">Linha do Tempo de Valiran</h1>
        <p className="page-lede">
          Da forja do mundo ao presente da campanha. Cada era carrega o peso
          das que vieram antes — e os segredos que ninguém mais lembra.
        </p>
      </header>

      {isEditor && (
        <div style={{display:'flex',justifyContent:'flex-end',padding:'0 0 28px'}}>
          <button style={S_tl.btnPrimary} onClick={() => setShowForm(true)}>+ Novo evento</button>
        </div>
      )}

      <div className="timeline">
        {events.map((e, i) => {
          if (e.era) return (
            <div key={i} className="tl-era">
              <div className="tl-era-label">{e.era}</div>
            </div>
          );
          return (
            <div key={i} className={'tl-event' + (e.kind ? ' ' + e.kind : '')} style={{position:'relative'}}>
              <div className="tl-event-year">
                <span className="tl-year">{e.year}</span>
                {e.label && <span className="tl-label">{e.label}</span>}
              </div>
              <div className="tl-event-body">
                <h3 className="tl-event-title">{e.title}</h3>
                {e.desc && <p className="tl-event-desc">{e.desc}</p>}
                {e.tag && <span className="tl-tag">{e.tag}</span>}
              </div>
              {isEditor && (
                <div style={{display:'flex', gap:6, alignItems:'center', paddingTop:2}}>
                  {confirmIdx === i && (
                    <button onClick={() => setConfirmIdx(null)} style={{...S_tl.btnPrimary, fontSize:9, padding:'4px 10px', opacity:0.5}}>Cancelar</button>
                  )}
                  <button
                    onClick={() => handleDelete(i, e)}
                    disabled={deletingIdx === i}
                    style={{
                      ...S_tl.btnPrimary, fontSize:9, padding:'4px 10px',
                      ...(confirmIdx === i ? { borderColor:'#c84b4b', color:'#c84b4b' } : { opacity:0.45 }),
                    }}
                  >
                    {deletingIdx === i ? '...' : confirmIdx === i ? 'Confirmar exclusão' : 'Excluir'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && <TimelineEventModal onClose={() => setShowForm(false)} onSaved={handleSaved} />}
    </div>
  );
}

window.Timeline = Timeline;
