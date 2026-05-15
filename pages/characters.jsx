// Dramatis Personae — character gallery + editor UI

const S_char = {
  editorBar: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 0 28px' },
  btnPrimary: { padding:'10px 22px', background:'transparent', border:'1px solid var(--gold-dim)', color:'var(--gold-bright)', fontFamily:'Cinzel, serif', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 },
  overlay: { position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.78)', display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'60px 20px 40px' },
  modal: { background:'var(--bg-page)', border:'1px solid var(--gold-dim)', borderRadius:4, padding:'44px 48px', width:'100%', maxWidth:680 },
  field: { display:'flex', flexDirection:'column', gap:7 },
  label: { fontFamily:'JetBrains Mono', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--foam-dim)' },
  input: { padding:'10px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--ink-line)', borderRadius:2, color:'var(--parchment)', fontFamily:'EB Garamond, serif', fontSize:15, outline:'none' },
  textarea: { padding:'10px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--ink-line)', borderRadius:2, color:'var(--parchment)', fontFamily:'EB Garamond, serif', fontSize:15, outline:'none', resize:'vertical', lineHeight:1.6 },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  hint: { fontFamily:'JetBrains Mono', fontSize:9, color:'var(--foam-dim)', letterSpacing:'0.1em' },
  select: { padding:'10px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--ink-line)', borderRadius:2, color:'var(--parchment)', fontFamily:'EB Garamond, serif', fontSize:15, outline:'none' },
};

function CharacterFormModal({ initial, onClose, onSaved }) {
  const toForm = (c) => c ? ({
    id: c.id || '', name: c.name || '', role: c.role || '',
    tag: c.tag || 'PC', tagClass: c.tagClass || 'pc',
    hero: c.hero || '',
    infoboxRows: Array.isArray(c.infobox?.rows) ? c.infobox.rows.map(r=>(r.danger?'[!] ':r.ok?'[ok] ':'')+r.k+'::'+r.v).join('\n') : '',
    statusNote: c.infobox?.statusNote || '',
    sections: Array.isArray(c.sections) ? c.sections.map(s => '## '+s.title+'\n'+s.paras.join('\n\n')).join('\n\n---\n\n') : '',
  }) : { id:'', name:'', role:'', tag:'PC', tagClass:'pc', hero:'', infoboxRows:'', statusNote:'', sections:'' };

  const [form, setForm]     = React.useState(toForm(initial));
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState('');
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  // Auto-sync tagClass when tag changes
  function setTag(v) {
    const cls = v==='PC'?'pc': v==='ALIADO'?'ally':'foe';
    setForm(f => ({...f, tag:v, tagClass:cls}));
  }

  function parseRows(str) {
    return str.split('\n').map(s=>s.trim()).filter(Boolean).map(s => {
      const danger = s.startsWith('[!] ');
      const ok     = s.startsWith('[ok] ');
      const clean  = s.replace(/^\[!!\] |^\[ok\] |^\[!\] /,'');
      const [k,...rest] = clean.split('::');
      return { k: k.trim(), v: rest.join('::').trim(), ...(danger?{danger:true}:{}), ...(ok?{ok:true}:{}) };
    });
  }

  function parseSections(str) {
    return str.split(/\n---\n/).map(block => {
      const lines = block.trim().split('\n');
      const titleLine = lines.shift() || '';
      const title = titleLine.replace(/^##\s*/,'').trim();
      const paras = lines.join('\n').split('\n\n').map(p=>p.trim()).filter(Boolean);
      return { title, paras };
    }).filter(s=>s.title);
  }

  async function handleSave() {
    if (!form.id || !form.name) { setError('ID e Nome são obrigatórios.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        id: form.id.toLowerCase().replace(/\s+/g,'-'),
        name: form.name, role: form.role, tag: form.tag, tagClass: form.tagClass,
        hero: form.hero, placeholder: false,
        infobox: { rows: parseRows(form.infoboxRows), statusNote: form.statusNote },
        sections: parseSections(form.sections),
        related: initial?.related || [],
      };
      await DB.saveCharacter(payload);
      window.Entities.characters[payload.id] = payload;
      onSaved(payload);
    } catch(e) { setError('Erro ao salvar: ' + e.message); }
    setSaving(false);
  }

  return (
    <div style={S_char.overlay} onClick={onClose}>
      <div style={S_char.modal} onClick={e=>e.stopPropagation()}>
        <h2 style={{fontFamily:'Cinzel,serif',fontSize:20,fontWeight:400,color:'var(--parchment)',margin:'0 0 32px'}}>
          {initial ? 'Editar · '+initial.name : 'Novo Personagem'}
        </h2>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>

          <div style={S_char.grid2}>
            <div style={S_char.field}>
              <label style={S_char.label}>ID (slug único) *</label>
              <input style={S_char.input} value={form.id} onChange={e=>set('id',e.target.value)} placeholder="kathryn-verlaine" disabled={!!initial} />
              <span style={S_char.hint}>Sem espaços, apenas letras e hífens</span>
            </div>
            <div style={S_char.field}>
              <label style={S_char.label}>Tipo</label>
              <select style={S_char.select} value={form.tag} onChange={e=>setTag(e.target.value)}>
                <option value="PC">PC — Personagem do jogador</option>
                <option value="ALIADO">ALIADO</option>
                <option value="INIMIGO">INIMIGO</option>
              </select>
            </div>
          </div>

          <div style={S_char.field}>
            <label style={S_char.label}>Nome completo *</label>
            <input style={S_char.input} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Käthryn Verlaine" />
          </div>

          <div style={S_char.field}>
            <label style={S_char.label}>Papel / subtítulo</label>
            <input style={S_char.input} value={form.role} onChange={e=>set('role',e.target.value)} placeholder="Paladina dissidente · órfã de Lancaster" />
          </div>

          <div style={S_char.field}>
            <label style={S_char.label}>Texto hero (parágrafo de abertura)</label>
            <textarea style={{...S_char.textarea, minHeight:80}} value={form.hero} onChange={e=>set('hero',e.target.value)} placeholder="Quando Lancaster caiu, Käthryn tinha vinte e quatro anos..." />
          </div>

          <div style={S_char.field}>
            <label style={S_char.label}>Linhas da infobox (uma por linha · formato: Chave::Valor · prefixe [!] para perigo, [ok] para ok)</label>
            <textarea style={{...S_char.textarea, minHeight:120, fontFamily:'JetBrains Mono', fontSize:12}} value={form.infoboxRows} onChange={e=>set('infoboxRows',e.target.value)}
              placeholder={"Classe::Paladina · nv. 7\nOrigem::Lancaster (caído)\n[!]Status::Procurada por Oshain\n[ok]Juramento::Vingança"} />
          </div>

          <div style={S_char.field}>
            <label style={S_char.label}>Nota de status (rodapé da infobox)</label>
            <textarea style={{...S_char.textarea, minHeight:50}} value={form.statusNote} onChange={e=>set('statusNote',e.target.value)} placeholder="Procurada por Oshain sob o nome 'a paladina de Lancaster'." />
          </div>

          <div style={S_char.field}>
            <label style={S_char.label}>Seções biográficas (separe seções com uma linha contendo apenas ---)</label>
            <textarea style={{...S_char.textarea, minHeight:160}} value={form.sections} onChange={e=>set('sections',e.target.value)}
              placeholder={"## Biografia\nPrimeiro parágrafo.\n\nSegundo parágrafo.\n\n---\n\n## Personalidade\nDescrição..."} />
          </div>

          {error && <div style={{color:'#c84b4b',fontFamily:'JetBrains Mono',fontSize:10}}>{error}</div>}

          <div style={{display:'flex',gap:12,justifyContent:'flex-end',paddingTop:8}}>
            <button onClick={onClose} style={{...S_char.btnPrimary,opacity:0.5}}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{...S_char.btnPrimary,opacity:saving?0.6:1}}>
              {saving?'Salvando...':'Salvar personagem'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Characters({ onNav }) {
  const { isEditor } = useAuth();
  const [showForm, setShowForm] = React.useState(false);
  const [cast, setCast] = React.useState(() => {
    const base = [
      { id:'kathryn',    tag:'PC',      tagClass:'pc',   name:'Käthryn Verlaine',    role:'Paladina dissidente · Lancaster',            faction:'Lancaster (caído)',   cls:'Paladina · nv. 7' },
      { id:'halric',     tag:'PC',      tagClass:'pc',   name:'Halric Stillvein',    role:'Bardo errante · um conto por estalagem',     faction:'Independente',       cls:'Bardo · nv. 7' },
      { id:'sothia',     tag:'PC',      tagClass:'pc',   name:'Sothia das Cinzas',   role:'Maga warforged · primeira da linhagem',      faction:'Lorean Treaz',       cls:'Feiticeira · nv. 7' },
      { id:'mavor',      tag:'PC',      tagClass:'pc',   name:'Mavor Iceblood',      role:'Mercenário de Ferro · imune à Trama',        faction:'Império de Ferro',   cls:'Guerreiro · nv. 7' },
      { id:'vensothiel', tag:'ALIADO',  tagClass:'ally', name:'Mestra Ven Sothiel',  role:'Arquimaga decana · mentora arrelíquia',      faction:'Lorean Treaz',       cls:'Arquimaga · nv. 18' },
      { id:'vagliesII',  tag:'ALIADO',  tagClass:'ally', name:'Vaglies II',          role:'Filho do rei mártir · em exílio',            faction:'Lancaster (exilado)',cls:'Clérigo · nv. 12' },
      { id:'annabella',  tag:'INIMIGO', tagClass:'foe',  name:'Annabella Whiteflame',role:'A Rainha Branca · não envelhece',             faction:'Oshain',             cls:'???' },
      { id:'noel',       tag:'INIMIGO', tagClass:'foe',  name:'Noel Braent',         role:'O Agente do Selo · rosto na multidão',       faction:'Blackflame',         cls:'Ladina arcana · ???' },
      { id:'caedric',    tag:'INIMIGO', tagClass:'foe',  name:'"Irmão Caedric"',     role:'Lacrimosi · prega libertação',               faction:'Lacrimosi',          cls:'Necromante · nv. 14' },
    ];
    // Merge with any db characters not in base list
    const baseIds = new Set(base.map(c=>c.id));
    const extra = Object.values(window.Entities.characters||{})
      .filter(c => c && typeof c !== 'function' && !baseIds.has(c.id))
      .map(c => ({ id:c.id, tag:c.tag, tagClass:c.tagClass, name:c.name, role:c.role, faction:'', cls:'' }));
    return [...base, ...extra];
  });

  function handleSaved(char) {
    setCast(prev => {
      const exists = prev.find(c=>c.id===char.id);
      if (exists) return prev.map(c=>c.id===char.id?{...c,name:char.name,role:char.role,tag:char.tag,tagClass:char.tagClass}:c);
      return [...prev, {id:char.id,tag:char.tag,tagClass:char.tagClass,name:char.name,role:char.role,faction:'',cls:''}];
    });
    setShowForm(false);
  }

  return (
    <div className="page" data-screen-label="12 Dramatis Personae">
      <header className="page-header">
        <div className="page-eyebrow">Crônicas · Volume IV · O Elenco</div>
        <h1 className="page-title">Dramatis Personae</h1>
        <p className="page-lede">
          Todos os nomes que importam no momento atual da história — heróis de mesa,
          aliados ganhos, antagonistas confirmados.
        </p>
      </header>

      {isEditor && (
        <div style={S_char.editorBar}>
          <div />
          <button style={S_char.btnPrimary} onClick={() => setShowForm(true)}>+ Novo personagem</button>
        </div>
      )}

      <div className="cast-grid">
        {cast.map(c => (
          <article key={c.id} className="cast-card" onClick={() => onNav('character:' + c.id)}>
            <div className="cast-portrait">
              <image-slot id={'char-portrait-'+c.id} shape="rect" placeholder={'Arraste retrato · '+c.name} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}></image-slot>
              <span className={'cast-portrait-tag '+c.tagClass} style={{zIndex:2}}>{c.tag}</span>
            </div>
            <div className="cast-body">
              <h3 className="cast-name">{c.name}</h3>
              <p className="cast-role">{c.role}</p>
              <div className="cast-meta">
                {c.faction && <span className="faction">{c.faction}</span>}
                {c.cls && <span>{c.cls}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>

      {showForm && <CharacterFormModal initial={null} onClose={() => setShowForm(false)} onSaved={handleSaved} />}
    </div>
  );
}

window.Characters       = Characters;
window.CharacterFormModal = CharacterFormModal;
