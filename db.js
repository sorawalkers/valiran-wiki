// db.js — sincroniza dados do Supabase com window.Data e window.Entities
// O app já renderiza com dados estáticos; este arquivo apenas enriquece.

window.DB = {

  async loadAll() {
    if (!window.sb) return;

    // Busca tudo em paralelo, cada um com tratamento individual
    const safe = async (query) => {
      try { const r = await query; return r.data || []; }
      catch(e) { console.warn('DB query failed:', e); return []; }
    };

    const [latest, deities, timeline, regions, characters, sessions, articles] = await Promise.all([
      safe(window.sb.from('latest_entries').select('*').order('sort_order')),
      safe(window.sb.from('deities').select('*').order('tier_order')),
      safe(window.sb.from('timeline_events').select('*').order('sort_order')),
      safe(window.sb.from('regions').select('*')),
      safe(window.sb.from('characters').select('*')),
      safe(window.sb.from('sessions').select('*').order('num', { ascending: false })),
      safe(window.sb.from('articles').select('*')),
    ]);

    // Entradas recentes
    if (latest.length && window.Data) {
      window.Data.latest = latest.map(e => ({
        tag: e.tag, title: e.title, excerpt: e.excerpt,
        meta: e.meta, author: e.author, target: e.target,
      }));
    }

    // Panteão
    if (deities.length && window.Data) {
      const TIER_LABELS = {
        titan:    { label: 'Os Titãs',           desc: 'As divindades primordiais que ergueram o mundo do nada.' },
        pantheon: { label: 'Deuses do Panteão',  desc: 'As divindades estabelecidas, veneradas em templos por todo o continente.' },
        ascended: { label: 'Ascendidos',          desc: 'Mortais que provaram-se grandes demais para a morte.' },
      };
      const grouped = {};
      deities.forEach(g => {
        if (!grouped[g.tier]) grouped[g.tier] = [];
        grouped[g.tier].push({ id: g.id, name: g.name, epithet: g.epithet, sigil: g.sigil, domain: g.domain, alignment: g.alignment, aligned: g.aligned, opposed: g.opposed });
      });
      window.Data.pantheon = ['titan','pantheon','ascended']
        .filter(t => grouped[t])
        .map(t => ({ tier: TIER_LABELS[t].label, tierDesc: TIER_LABELS[t].desc, gods: grouped[t] }));
    }

    // Linha do tempo
    if (timeline.length && window.Data) {
      window.Data.timeline = timeline.map(e =>
        e.is_era ? { era: e.era_label }
                 : { year: e.year, label: e.label, title: e.title, desc: e.description, tag: e.tag, kind: e.kind }
      );
    }

    // Sessões
    if (sessions.length && window.Entities && window.Entities.sessions) {
      sessions.forEach(s => {
        window.Entities.sessions[String(s.num)] = {
          num: s.num, date: s.date_display, dateShort: s.date_short,
          title: s.title, location: s.location, locationDetail: s.location_detail,
          duration: s.duration, session_xp: s.session_xp, summary: s.summary,
          cast: s.cast_list || [], places: s.places || [], narrative: s.narrative || [],
          keypoints: s.keypoints || [], loot: s.loot || [],
          gmnote: s.gm_note, next: s.next_session,
        };
      });
    }

    // Personagens
    if (characters.length && window.Entities && window.Entities.characters) {
      characters.forEach(c => {
        if (!c.id) return;
        window.Entities.characters[c.id] = {
          id: c.id, name: c.name, role: c.role, tag: c.tag, tagClass: c.tag_class,
          hero: c.hero_text, placeholder: c.placeholder,
          infobox: c.infobox || { rows: [], statusNote: '' },
          sections: c.sections || [], related: c.related || [],
        };
      });
    }

    // Divindades (para detalhe)
    if (deities.length && window.Entities && window.Entities.deities) {
      deities.forEach(d => {
        if (!d.id) return;
        window.Entities.deities[d.id] = {
          id: d.id, name: d.name, epithet: d.epithet, sigil: d.sigil,
          hero: d.hero_text, placeholder: d.placeholder,
          infobox: d.infobox || { rows: [], statusNote: '' },
          sections: d.sections || [], related: d.related || [],
        };
      });
    }
  },

  // ── Operações de escrita ──────────────────────────────────────────────────

  async saveSession(data) {
    const payload = {
      num: parseInt(data.num), title: data.title,
      date_display: data.date, date_short: data.dateShort,
      location: data.location, location_detail: data.locationDetail,
      duration: data.duration, session_xp: data.session_xp, summary: data.summary,
      cast_list: data.cast || [], places: data.places || [],
      narrative: data.narrative || [], keypoints: data.keypoints || [],
      loot: data.loot || [], gm_note: data.gmnote, next_session: data.next,
    };
    const { error } = await window.sb.from('sessions').upsert(payload, { onConflict: 'num' });
    if (error) throw error;
  },

  async saveCharacter(data) {
    const payload = {
      id: data.id, name: data.name, role: data.role,
      tag: data.tag, tag_class: data.tagClass,
      hero_text: data.hero, placeholder: data.placeholder || false,
      infobox: data.infobox || { rows: [] },
      sections: data.sections || [], related: data.related || [],
    };
    const { error } = await window.sb.from('characters').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  },

  async saveTimelineEvent(data) {
    const payload = {
      sort_order: data.sort_order || Date.now(),
      is_era: false, year: data.year, label: data.label,
      title: data.title, description: data.desc, tag: data.tag, kind: data.kind || null,
    };
    const { error } = await window.sb.from('timeline_events').insert(payload);
    if (error) throw error;
  },

  async saveDeity(data) {
    const payload = {
      id: data.id, tier: data.tier, tier_order: data.tier_order || 99,
      name: data.name, epithet: data.epithet, sigil: data.sigil,
      domain: data.domain, alignment: data.alignment,
      aligned: data.aligned || false, opposed: data.opposed || false,
      hero_text: data.hero_text || '', placeholder: data.placeholder || true,
      infobox: data.infobox || {}, sections: data.sections || [], related: data.related || [],
    };
    const { error } = await window.sb.from('deities').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  },
};
