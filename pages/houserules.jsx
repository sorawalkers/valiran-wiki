// House rules — documentation + editor UI

function HouleruleAddModal({ onClose }) {
  const [form, setForm] = React.useState({ title:'', category:'', content:'' });
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inSt = {padding:'10px 13px',background:'rgba(255,255,255,0.04)',border:'1px solid var(--ink-line)',borderRadius:2,color:'var(--parchment)',fontFamily:'EB Garamond,serif',fontSize:15,outline:'none'};
  const lbSt = {fontFamily:'JetBrains Mono',fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--foam-dim)'};

  async function handleSave() {
    if (!form.title) { setError('Título é obrigatório.'); return; }
    setSaving(true);
    try {
      await sb.from('houserules').insert({ title:form.title, category:form.category, content:form.content, sort_order: Date.now() });
      onClose(true);
    } catch(e) { setError('Erro: '+e.message); setSaving(false); }
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:9000,background:'rgba(0,0,0,0.78)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>onClose(false)}>
      <div style={{background:'var(--bg-page)',border:'1px solid var(--gold-dim)',borderRadius:4,padding:'44px 48px',width:560,maxWidth:'90vw'}} onClick={e=>e.stopPropagation()}>
        <h2 style={{fontFamily:'Cinzel,serif',fontSize:18,fontWeight:400,color:'var(--parchment)',margin:'0 0 28px'}}>Nova Regra da Casa</h2>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'flex',flexDirection:'column',gap:7}}><label style={lbSt}>Título *</label><input style={inSt} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Morte Heroica" /></div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}><label style={lbSt}>Categoria</label><input style={inSt} value={form.category} onChange={e=>set('category',e.target.value)} placeholder="Combate, Magia, Interpretação..." /></div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}><label style={lbSt}>Conteúdo da regra</label><textarea style={{...inSt,resize:'vertical',minHeight:120,lineHeight:1.6}} value={form.content} onChange={e=>set('content',e.target.value)} placeholder="Descreva a regra em detalhes..." /></div>
          {error && <div style={{color:'#c84b4b',fontFamily:'JetBrains Mono',fontSize:10}}>{error}</div>}
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button onClick={()=>onClose(false)} style={{padding:'9px 18px',background:'transparent',border:'1px solid var(--ink-line)',color:'var(--foam-dim)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2}}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{padding:'9px 18px',background:'transparent',border:'1px solid var(--gold-dim)',color:'var(--gold-bright)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2,opacity:saving?0.6:1}}>{saving?'Salvando...':'Criar regra'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HouseRules({ onNav }) {
  const { isEditor } = useAuth();
  const [showAdd, setShowAdd] = React.useState(false);

  const rules = [
    {
      title: 'Inspiração & Pontos do Destino',
      body: (
        <React.Fragment>
          <p>Cada jogador começa a sessão com <code>1 ponto de Inspiração</code>. Pode ser gasto para rolar com vantagem em um teste, OU dado a outro jogador como reconhecimento de boa interpretação.</p>
          <p>O Mestre concede Inspiração extra quando: (a) você descreve a ação em vez de citar a mecânica, (b) você toma uma decisão difícil em vez de uma fácil, (c) você faz a mesa rir sem quebrar o tom.</p>
          <div className="docs-callout"><strong>Pontos do Destino</strong> são Inspirações acumuladas entre sessões — máximo 3. Podem ser usados para negar um acerto crítico ou estabilizar automaticamente.</div>
        </React.Fragment>
      )
    },
    {
      title: 'Morte & Consequências Narrativas',
      body: (
        <React.Fragment>
          <p>Personagens que chegam a 0 PV fazem testes de morte normalmente. Após três falhas, a morte é permanente — mas o jogador <em>escolhe como acontece</em>.</p>
          <p>O jogador narra a última cena do personagem. O Mestre não interrompe.</p>
          <div className="docs-callout warning"><strong>Exceção:</strong> mortes causadas por negligência deliberada ou separação do grupo sem aviso podem ser narradas pelo Mestre. Esta regra não foi invocada até o momento.</div>
        </React.Fragment>
      )
    },
    {
      title: 'Trama Mágica · Contaminação',
      body: (
        <React.Fragment>
          <p>Qualquer feitiço de nível 3 ou superior lançado em área corrompida exige um teste de Arcana (CD 14). Falha: o feitiço funciona, mas atrai atenção de uma entidade planar por <code>1d4 horas</code>.</p>
          <p>Personagens com alinhamento ligado à Trama (Sothia, Käthryn via Esmir) jogam com desvantagem em testes de Sabedoria enquanto na região de Nova Lancaster.</p>
        </React.Fragment>
      )
    },
    {
      title: 'Idiomas & Informação',
      body: (
        <React.Fragment>
          <p>Idiomas têm peso narrativo. Se o seu personagem não fala o idioma de um NPC, a comunicação é resolvida com pantomima e testes de Persuasão com desvantagem — sem tradução mágica automática.</p>
          <p>Informação obtida corretamente (bom teste, boa interpretação, aliado confiável) é <em>verdadeira</em>. Informação obtida de inimigo ou sob pressão pode ser falsa — o Mestre não avisará.</p>
        </React.Fragment>
      )
    },
    {
      title: 'Descanso Curto & Longo em Campo',
      body: (
        <React.Fragment>
          <p>Descanso curto: 1 hora em ambiente razoavelmente seguro. Descanso longo: 8 horas — mas em território corrompido, o descanso longo exige um teste de Constituição (CD 12) ou o personagem não recupera slots de magia (PV se recuperam normalmente).</p>
          <div className="docs-callout">Mavor é imune à condição de descanso prejudicado por corrupção. Ele ainda tem pesadelos.</div>
        </React.Fragment>
      )
    },
  ];

  return (
    <div className="page" data-screen-label="14 Regras da Casa">
      <header className="page-header">
        <div className="page-eyebrow">Mesa · Documentação · Rev. 1281</div>
        <h1 className="page-title">Regras da Casa</h1>
        <p className="page-lede">
          Adaptações ao D&D 5e para esta campanha. Todas foram discutidas e
          acordadas na sessão zero — se algo aqui te surpreende, provavelmente
          você dormiu naquele dia.
        </p>
      </header>

      {isEditor && (
        <div style={{display:'flex',justifyContent:'flex-end',padding:'0 0 24px'}}>
          <button style={{padding:'10px 22px',background:'transparent',border:'1px solid var(--gold-dim)',color:'var(--gold-bright)',fontFamily:'Cinzel,serif',fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',cursor:'pointer',borderRadius:2}} onClick={()=>setShowAdd(true)}>+ Nova regra</button>
        </div>
      )}

      <div className="docs-grid">
        {rules.map((r, i) => (
          <section key={i} className="docs-section">
            <h2 className="docs-title">{r.title}</h2>
            <div className="docs-body">{r.body}</div>
          </section>
        ))}
      </div>

      {showAdd && <HouleruleAddModal onClose={(saved)=>setShowAdd(false)} />}
    </div>
  );
}

window.HouseRules = HouseRules;
