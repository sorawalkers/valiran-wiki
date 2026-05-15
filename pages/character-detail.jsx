// Character detail — full article + edit button for editors

function CharacterDetail({ id, onNav }) {
  const { isEditor } = useAuth();
  const [showEdit, setEdit] = React.useState(false);

  let c = window.Entities.characters[id];
  if (!c || typeof c === 'function') {
    const fallbackMap = {
      sothia:     ['Sothia das Cinzas',    'Maga warforged · primeira da linhagem',      'PC',      'pc'],
      mavor:      ['Mavor Iceblood',       'Mercenário de Ferro · imune à Trama',        'PC',      'pc'],
      vensothiel: ['Mestra Ven Sothiel',   'Arquimaga decana · mentora arrelíquia',      'ALIADO',  'ally'],
      vagliesII:  ['Vaglies II',           'Filho do rei mártir · em exílio',            'ALIADO',  'ally'],
      noel:       ['Noel Braent',          'O Agente do Selo · rosto na multidão',       'INIMIGO', 'foe'],
      caedric:    ['"Irmão Caedric"',      'Lacrimosi · prega libertação',               'INIMIGO', 'foe'],
    };
    const f = fallbackMap[id];
    if (f) c = Entities.characters._placeholder(id, f[0], f[1], f[2], f[3]);
  }

  const [char, setChar] = React.useState(c);

  if (!char) return (
    <div className="page">
      <button className="back-btn" onClick={() => onNav('characters')}>Voltar à galeria</button>
      <h1 className="page-title">Personagem não encontrado</h1>
    </div>
  );

  function handleSaved() { setChar({ ...window.Entities.characters[id] }); setEdit(false); }

  const infobox = char.infobox || {};
  const rows    = infobox.rows || [];

  return (
    <div className="article" data-screen-label={'Personagem · ' + char.name}>
      <div className="parchment" style={{minWidth:0}}>
        <div className="article-body">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
            <button className="back-btn" style={{margin:0}} onClick={() => onNav('characters')}>Voltar à galeria</button>
            {isEditor && !char.placeholder && (
              <button style={{padding:'8px 18px',background:'transparent',border:'1px solid var(--gold-dim)',color:'var(--gold-bright)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2}} onClick={() => setEdit(true)}>
                Editar personagem
              </button>
            )}
          </div>

          <nav className="breadcrumb">
            <a onClick={() => onNav('home')}>Arquivo</a>
            <span className="sep">▸</span>
            <a onClick={() => onNav('characters')}>Dramatis Personae</a>
            <span className="sep">▸</span>
            <span>{char.name}</span>
          </nav>

          <h1 className="article-title">{char.name}</h1>
          <p className="article-subtitle">{char.role}</p>

          <div className="article-divider"><Sigil.Ornament /></div>

          {char.placeholder ? (
            <React.Fragment>
              <p className="detail-hero">{char.hero}</p>
              <div className="placeholder-banner">
                <div className="placeholder-banner-eyebrow" style={{color:'var(--wine)'}}>Em compilação</div>
                <h3>Esta entrada ainda está sendo transcrita</h3>
                <p>O arquivista Cael reuniu o esqueleto desta entrada. Biografia detalhada e eventos serão acrescentados nas próximas sessões.</p>
                {isEditor && (
                  <button style={{marginTop:16,padding:'8px 18px',background:'transparent',border:'1px solid var(--gold-dim)',color:'var(--gold-bright)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2}} onClick={() => setEdit(true)}>
                    Preencher entrada
                  </button>
                )}
              </div>
            </React.Fragment>
          ) : (
            <div className="prose">
              <p className="detail-hero">{char.hero}</p>
              {(char.sections||[]).map((sec,si) => (
                <React.Fragment key={sec.title}>
                  <h2>{sec.title}</h2>
                  {sec.paras.map((p,i) => <p key={i} className={si===0&&i===0?'dropcap':''}>{p}</p>)}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="infobox-rail">
        <div className="infobox">
          <div className="infobox-head">
            <div className="infobox-portrait-wrap">
              <image-slot id={'char-portrait-'+char.id} shape="rect" placeholder={'Retrato · '+char.name} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}></image-slot>
              <span className={'infobox-portrait-tag '+(char.tagClass||'pc')} style={{zIndex:2}}>{char.tag||'PC'}</span>
            </div>
            <h3 className="infobox-name">{char.name}</h3>
            <p className="infobox-sub">{char.role}</p>
          </div>
          {rows.length > 0 && (
            <dl className="infobox-rows">
              {rows.map(r => (
                <div key={r.k} className="infobox-row">
                  <dt>{r.k}</dt>
                  <dd className={r.danger?'danger':r.ok?'ok':''}>{r.v}</dd>
                </div>
              ))}
            </dl>
          )}
          {infobox.statusNote && (
            <div className="infobox-status">
              <strong>{char.tag==='INIMIGO'?'AVISO ARQUIVÍSTICO':'NOTA'}</strong><br />
              {infobox.statusNote}
            </div>
          )}
        </div>

        {char.related && char.related.length > 0 && (
          <div className="related">
            <h4 className="related-title">Cf. Relacionados</h4>
            {char.related.map(r => (
              <a key={r.title} className="related-link" onClick={() => onNav(r.target)}>
                <span className="related-link-tag">{r.tag}</span>
                <span className="related-link-title">{r.title}</span>
              </a>
            ))}
          </div>
        )}
      </aside>

      {showEdit && (
        <CharacterFormModal initial={char} onClose={() => setEdit(false)} onSaved={handleSaved} />
      )}
    </div>
  );
}

window.CharacterDetail = CharacterDetail;
