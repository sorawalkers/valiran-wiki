// Sessions — card grid + detail page + editor UI

const S_sess = {
  editorBar: { display: 'flex', justifyContent: 'flex-end', padding: '0 0 28px' },
  btnPrimary: {
    padding: '10px 22px', background: 'transparent',
    border: '1px solid var(--gold-dim)', color: 'var(--gold-bright)',
    fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em',
    textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
  },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9000,
    background: 'rgba(0,0,0,0.78)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    overflowY: 'auto', padding: '60px 20px 40px',
  },
  modal: {
    background: 'var(--bg-page)', border: '1px solid var(--gold-dim)',
    borderRadius: 4, padding: '44px 48px', width: '100%', maxWidth: 720,
  },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--foam-dim)' },
  input: { padding: '10px 13px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ink-line)', borderRadius: 2, color: 'var(--parchment)', fontFamily: 'EB Garamond, serif', fontSize: 15, outline: 'none' },
  textarea: { padding: '10px 13px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ink-line)', borderRadius: 2, color: 'var(--parchment)', fontFamily: 'EB Garamond, serif', fontSize: 15, outline: 'none', resize: 'vertical', minHeight: 80, lineHeight: 1.6 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  hint: { fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--foam-dim)', letterSpacing: '0.1em' },
};

function SessionFormModal({ initial, onClose, onSaved }) {
  const toForm = (s) => s ? ({
    num: String(s.num), title: s.title || '', date: s.date || '', dateShort: s.dateShort || '',
    location: s.location || '', locationDetail: s.locationDetail || '',
    duration: s.duration || '', session_xp: s.session_xp || '', summary: s.summary || '',
    cast:      Array.isArray(s.cast)      ? s.cast.join('\n')        : '',
    places:    Array.isArray(s.places)    ? s.places.join('\n')      : '',
    narrative: Array.isArray(s.narrative) ? s.narrative.join('\n\n') : '',
    loot:      Array.isArray(s.loot)      ? s.loot.join('\n')        : '',
    keypoints: Array.isArray(s.keypoints) ? s.keypoints.map(k => (k.danger ? '[!] ' : '') + k.text).join('\n') : '',
    gmnote: s.gmnote || '', next: s.next || '',
  }) : { num:'', title:'', date:'', dateShort:'', location:'', locationDetail:'', duration:'', session_xp:'', summary:'', cast:'', places:'', narrative:'', keypoints:'', loot:'', gmnote:'', next:'' };

  const [form, setForm]   = React.useState(toForm(initial));
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.num || !form.title) { setError('Número e título são obrigatórios.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        num: parseInt(form.num), title: form.title, date: form.date,
        dateShort: form.dateShort, location: form.location, locationDetail: form.locationDetail,
        duration: form.duration, session_xp: form.session_xp, summary: form.summary,
        cast:      form.cast.split('\n').map(s=>s.trim()).filter(Boolean),
        places:    form.places.split('\n').map(s=>s.trim()).filter(Boolean),
        narrative: form.narrative.split('\n\n').map(s=>s.trim()).filter(Boolean),
        loot:      form.loot.split('\n').map(s=>s.trim()).filter(Boolean),
        keypoints: form.keypoints.split('\n').map(s=>s.trim()).filter(Boolean).map(s=>({ danger: s.startsWith('[!]'), text: s.replace(/^\[!\]\s*/, '') })),
        gmnote: form.gmnote, next: form.next,
      };
      await DB.saveSession(payload);
      window.Entities.sessions[String(payload.num)] = payload;
      onSaved(payload.num);
    } catch(e) { setError('Erro ao salvar: ' + e.message); }
    setSaving(false);
  }

  const F = (label, key, placeholder, multiline, hint, rows) => (
    React.createElement('div', { style: S_sess.field },
      React.createElement('label', { style: S_sess.label }, label),
      multiline
        ? React.createElement('textarea', { style: { ...S_sess.textarea, minHeight: rows || 80 }, value: form[key], onChange: e => set(key, e.target.value), placeholder })
        : React.createElement('input',    { style: S_sess.input, value: form[key], onChange: e => set(key, e.target.value), placeholder }),
      hint && React.createElement('span', { style: S_sess.hint }, hint)
    )
  );

  return (
    <div style={S_sess.overlay} onClick={onClose}>
      <div style={S_sess.modal} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily:'Cinzel,serif', fontSize:20, fontWeight:400, color:'var(--parchment)', margin:'0 0 32px' }}>
          {initial ? 'Editar · Sessão ' + initial.num : 'Nova Sessão'}
        </h2>
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={S_sess.grid2}>
            {F('Número *', 'num', '24')}
            {F('Título *', 'title', 'O Pastor Cego')}
          </div>
          <div style={S_sess.grid2}>
            {F('Data por extenso', 'date', '21 do Segundo Mês, 1281')}
            {F('Data curta', 'dateShort', '21 · MAI · 1281')}
          </div>
          <div style={S_sess.grid2}>
            {F('Local', 'location', 'Pântanos de Velheath')}
            {F('Detalhe do local', 'locationDetail', 'três léguas a leste de Nova Lancaster')}
          </div>
          <div style={S_sess.grid2}>
            {F('Duração', 'duration', '4h 20min')}
            {F('XP da sessão', 'session_xp', '1.840 XP')}
          </div>
          {F('Resumo', 'summary', 'O grupo seguiu rastros de cascos partidos...', true, null, 70)}
          {F('Elenco (um por linha · NPCs: adicione (NPC) ao final)', 'cast', 'Käthryn\nHalric\nTannis (NPC)', true, 'NPCs: adicione (NPC) ao final do nome', 80)}
          {F('Lugares (um por linha)', 'places', 'Pântanos de Velheath\nPedra Triangular', true, null, 60)}
          {F('Narrativa (parágrafos separados por linha em branco)', 'narrative', 'Primeiro parágrafo...\n\nSegundo parágrafo...', true, null, 140)}
          {F('Pontos-chave (um por linha · prefixe com [!] para perigo)', 'keypoints', 'Ponto normal\n[!] Ponto de perigo', true, null, 100)}
          {F('Espólio & Descobertas (um por linha)', 'loot', '1× anel de prata\nMapa parcial', true, null, 60)}
          {F('Nota do GM (aparece no rodapé)', 'gmnote', 'Reflexão sobre a sessão...', true, null, 60)}
          {F('Próxima sessão', 'next', "Próxima sessão · 28 · MAI · 1281 · 'O Pastor Cego'")}

          {error && <div style={{ color:'#c84b4b', fontFamily:'JetBrains Mono', fontSize:10 }}>{error}</div>}

          <div style={{ display:'flex', gap:12, justifyContent:'flex-end', paddingTop:8 }}>
            <button onClick={onClose} style={{ ...S_sess.btnPrimary, opacity:0.5 }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{ ...S_sess.btnPrimary, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Salvando...' : 'Salvar sessão'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sessions({ onNav }) {
  const { isEditor } = useAuth();
  const [sessionIds, setIds] = React.useState(
    Object.keys(window.Entities.sessions || {}).sort((a,b) => parseInt(b)-parseInt(a))
  );
  const [showForm, setShowForm] = React.useState(false);

  function handleSaved(num) {
    const id = String(num);
    setIds(prev => [...new Set([...prev, id])].sort((a,b) => parseInt(b)-parseInt(a)));
    setShowForm(false);
  }

  return (
    <div className="page" data-screen-label="13 Diário de Sessões">
      <header className="page-header">
        <div className="page-eyebrow">Mesa · Vol. VIII · Diário ativo</div>
        <h1 className="page-title">Diário de Sessões</h1>
        <p className="page-lede">
          Cada sessão se torna um fólio. Os cards abaixo mostram o resumo rápido —
          pessoas, lugares, o que aconteceu em uma respiração. Clique em qualquer
          um para abrir o diário completo da sessão.
        </p>
      </header>

      {isEditor && (
        <div style={S_sess.editorBar}>
          <button style={S_sess.btnPrimary} onClick={() => setShowForm(true)}>+ Nova sessão</button>
        </div>
      )}

      <div className="session-card-grid">
        {sessionIds.map((id, i) => {
          const s = window.Entities.sessions[id];
          if (!s) return null;
          return (
            <article key={id} className={'session-card ' + (i===0?'latest':'')} onClick={() => onNav('session:' + id)}>
              <div className="session-card-head">
                <div>
                  <div className="session-card-num">{String(s.num).padStart(2,'0')}</div>
                  <div className="session-card-num-label">Sessão</div>
                </div>
                <div>
                  <div className="session-card-date">{s.dateShort}</div>
                  {i===0 && <div className="session-card-tag">Mais recente</div>}
                </div>
              </div>
              <h3 className="session-card-title">{s.title}</h3>
              <p className="session-card-location">↳ {s.location}</p>
              <p className="session-card-summary">{s.summary}</p>
              <div className="session-card-meta">
                <div className="session-card-meta-row">
                  <span className="session-card-meta-label">Pessoas</span>
                  <span className="session-card-meta-value">
                    {(s.cast||[]).slice(0,5).map(p => (
                      <span key={p} className={'chip-mini '+(p.includes('(NPC')?'npc':'')}>{p.replace(/ \(NPC.*\)/,'')}</span>
                    ))}
                  </span>
                </div>
                <div className="session-card-meta-row">
                  <span className="session-card-meta-label">Lugares</span>
                  <span className="session-card-meta-value">
                    {(s.places||[]).slice(0,4).map(p => <span key={p} className="chip-mini place">{p}</span>)}
                  </span>
                </div>
              </div>
              <div className="session-card-cta">Abrir diário completo →</div>
            </article>
          );
        })}
      </div>

      {showForm && <SessionFormModal initial={null} onClose={() => setShowForm(false)} onSaved={handleSaved} />}
    </div>
  );
}

function SessionDetail({ id, onNav }) {
  const { isEditor } = useAuth();
  const [s, setS]         = React.useState(window.Entities.sessions[id]);
  const [showEdit, setEdit] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const [deleting, setDeleting]     = React.useState(false);

  if (!s) return (
    <div className="page">
      <button className="back-btn" onClick={() => onNav('sessions')}>Voltar ao diário</button>
      <h1 className="page-title">Sessão não encontrada</h1>
    </div>
  );

  function handleSaved() { setS({ ...window.Entities.sessions[id] }); setEdit(false); }

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try {
      await DB.deleteSession(s.num);
      delete window.Entities.sessions[id];
      onNav('sessions');
    } catch(e) { console.error(e); setDeleting(false); setConfirmDel(false); }
  }

  const delBtnStyle = confirmDel
    ? { ...S_sess.btnPrimary, borderColor:'#c84b4b', color:'#c84b4b' }
    : { ...S_sess.btnPrimary, opacity: 0.6 };

  return (
    <div className="session-detail" data-screen-label={'Sessão ' + s.num}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <button className="back-btn" style={{ margin:0 }} onClick={() => onNav('sessions')}>Voltar ao diário</button>
        {isEditor && (
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {confirmDel && (
              <button style={{ ...S_sess.btnPrimary, opacity:0.5 }} onClick={() => setConfirmDel(false)}>Cancelar</button>
            )}
            <button style={delBtnStyle} onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo...' : confirmDel ? 'Confirmar exclusão' : 'Excluir sessão'}
            </button>
            <button style={S_sess.btnPrimary} onClick={() => setEdit(true)}>Editar sessão</button>
          </div>
        )}
      </div>

      <header className="session-detail-head">
        <div className="session-detail-num">{String(s.num).padStart(2,'0')}</div>
        <div className="session-detail-num-label">Sessão · {s.dateShort}</div>
        <h1 className="session-detail-title">{s.title}</h1>
        <p className="session-detail-location">↳ {s.location}</p>
        <p className="session-detail-location-sub">{s.locationDetail}</p>
        <div className="session-meta-strip">
          <div><span className="label">Data</span><span className="value">{s.date}</span></div>
          <div><span className="label">Duração</span><span className="value">{s.duration}</span></div>
          <div><span className="label">Experiência</span><span className="value">{s.session_xp}</span></div>
          <div><span className="label">Próxima</span><span className="value" style={{fontSize:12}}>{s.next}</span></div>
        </div>
      </header>

      <section className="session-detail-block">
        <h2>Resumo</h2>
        <p style={{fontStyle:'italic', color:'var(--foam)', fontSize:18}}>{s.summary}</p>
      </section>
      <section className="session-detail-block">
        <h2>Elenco da Sessão</h2>
        <div className="session-detail-chips">
          {(s.cast||[]).map(c => {
            const isNpc = c.includes('NPC');
            return <span key={c} className={'chip-mini '+(isNpc?'npc':'')} style={{fontSize:11,padding:'5px 10px'}}>{isNpc&&<span style={{opacity:0.6,marginRight:4}}>NPC ·</span>}{c.replace(/ \((NPC[^)]*)\)/,'')}</span>;
          })}
        </div>
      </section>
      <section className="session-detail-block">
        <h2>Lugares Visitados</h2>
        <div className="session-detail-chips">
          {(s.places||[]).map(p => <span key={p} className="chip-mini place" style={{fontSize:11,padding:'5px 10px'}}>{p}</span>)}
        </div>
      </section>
      <section className="session-detail-block">
        <h2>Narrativa</h2>
        {(s.narrative||[]).map((p,i) => <p key={i}>{p}</p>)}
      </section>
      <section className="session-detail-block">
        <h2>Pontos-Chave</h2>
        <ul className="session-keylist">
          {(s.keypoints||[]).map((k,i) => <li key={i} className={k.danger?'danger':''}>{k.text}</li>)}
        </ul>
      </section>
      {s.loot && s.loot.length > 0 && s.loot[0] !== '—' && (
        <section className="session-detail-block">
          <h2>Espólio & Descobertas</h2>
          <ul className="session-loot">{(s.loot||[]).map((l,i) => <li key={i}>{l}</li>)}</ul>
        </section>
      )}
      {s.gmnote && <section className="session-detail-block"><div className="gm-note">{s.gmnote}</div></section>}

      {showEdit && <SessionFormModal initial={s} onClose={() => setEdit(false)} onSaved={handleSaved} />}
    </div>
  );
}

window.Sessions      = Sessions;
window.SessionDetail = SessionDetail;
