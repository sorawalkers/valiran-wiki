// db.js — carrega todos os dados do Supabase e popula window.Data / window.Entities
// As páginas existentes continuam lendo Data.xxx e Entities.xxx normalmente.

window.DB = {

  // ── Carregamento inicial completo ──────────────────────────────────────────
  async loadAll() {
    const [
      latest, pantheon, timeline, regions,
      characters, sessions, deities, articles
    ] = await Promise.all([
      sb.from('latest_entries').select('*').order('sort_order'),
      sb.from('deities').select('*').order('tier_order'),
      sb.from('timeline_events').select('*').order('sort_order'),
      sb.from('regions').select('*'),
      sb.from('characters').select('*'),
      sb.from('sessions').select('*').order('num', { ascending: false }),
      sb.from('deities').select('*'),
      sb.from('articles').select('*'),
    ]);

    // ── popular window.Data ──────────────────────────────────────────────────

    // Entradas recentes
    if (latest.data) {
      window.Data.latest = latest.data.map(e => ({
        tag: e.tag, title: e.title, excerpt: e.excerpt,
        meta: e.meta, author: e.author, target: e.target,
      }));
    }

    // Panteão — agrupa por tier
    if (pantheon.data) {
      const TIER_LABELS = {
        titan:    { label: 'Os Titãs',            desc: 'As divindades primordiais que ergueram o mundo do nada. Hoje, distantes ou inalcançáveis.' },
        pantheon: { label: 'Deuses do Panteão',   desc: 'As divindades estabelecidas, veneradas em templos por todo o continente.' },
        ascended: { label: 'Ascendidos',           desc: 'Mortais que provaram-se diante dos planos e foram elevados ao manto divino.' },
      };
      const grouped = {};
      pantheon.data.forEach(g => {
        if (!grouped[g.tier]) grouped[g.tier] = [];
        grouped[g.tier].push({
          name: g.name, epithet: g.epithet, sigil: g.sigil,
          domain: g.domain, alignment: g.alignment,
          aligned: g.aligned, opposed: g.opposed,
        });
      });
      window.Data.pantheon = ['titan','pantheon','ascended']
        .filter(t => grouped[t])
        .map(t => ({
          tier: TIER_LABELS[t].label,
          tierDesc: TIER_LABELS[t].desc,
          gods: grouped[t],
        }));
    }

    // Linha do tempo
    if (timeline.data) {
      window.Data.timeline = timeline.data.map(e =>
        e.is_era
          ? { era: e.era_label }
          : { year: e.year, label: e.label, title: e.title, desc: e.description, tag: e.tag, kind: e.kind }
      );
    }

    // Regiões do mapa
    if (regions.data) {
      window.Data.regions = regions.data.map(r => ({
        id: r.id, name: r.name, type: r.type, desc: r.description,
        stats: r.stats, fill: r.fill, stroke: r.stroke,
        d: r.path_d, labelX: r.label_x, labelY: r.label_y, cursed: r.cursed,
      }));
    }

    // Artigo principal (Ayael)
    if (articles.data && articles.data[0]) {
      const a = articles.data[0];
      window.Data.article = {
        breadcrumb: a.breadcrumb,
        title: a.title,
        subtitle: a.subtitle,
        infobox: a.infobox,
        toc: a.toc,
        sections: a.sections,
        related: a.related,
      };
    }

    // ── popular window.Entities ──────────────────────────────────────────────

    // Sessões
    if (sessions.data) {
      const sessMap = {};
      sessions.data.forEach(s => {
        sessMap[String(s.num)] = {
          num: s.num, date: s.date_display, dateShort: s.date_short,
          title: s.title, location: s.location, locationDetail: s.location_detail,
          duration: s.duration, session_xp: s.session_xp, summary: s.summary,
          cast: s.cast_list, places: s.places, narrative: s.narrative,
          keypoints: s.keypoints, loot: s.loot,
          gmnote: s.gm_note, next: s.next_session,
        };
      });
      window.Entities.sessions = sessMap;
    }

    // Personagens
    if (characters.data) {
      const charMap = {};
      characters.data.forEach(c => {
        charMap[c.id] = {
          id: c.id, name: c.name, role: c.role, tag: c.tag, tagClass: c.tag_class,
          hero: c.hero_text, infobox: c.infobox, sections: c.sections,
          related: c.related, placeholder: c.placeholder, image_url: c.image_url,
        };
      });
      // mantém funções _placeholder originais
      const origPlaceholder = window.Entities.characters._placeholder;
      window.Entities.characters = charMap;
      window.Entities.characters._placeholder = origPlaceholder;
    }

    // Divindades
    if (deities.data) {
      const deitMap = {};
      deities.data.forEach(d => {
        deitMap[d.id] = {
          id: d.id, name: d.name, epithet: d.epithet, sigil: d.sigil,
          hero: d.hero_text, infobox: d.infobox, sections: d.sections,
          related: d.related, placeholder: d.placeholder, image_url: d.image_url,
        };
      });
      const origPlaceholder = window.Entities.deities._placeholder;
      window.Entities.deities = deitMap;
      window.Entities.deities['ayael'] = null; // resolvido do Data.article
      window.Entities.deities._placeholder = origPlaceholder;
    }
  },

  // ── Operações de escrita (só editores/admins) ──────────────────────────────

  async saveSession(data) {
    const { num, ...rest } = data;
    const payload = {
      num, title: rest.title, date_display: rest.date, date_short: rest.dateShort,
      location: rest.location, location_detail: rest.locationDetail,
      duration: rest.duration, session_xp: rest.session_xp, summary: rest.summary,
      cast_list: rest.cast, places: rest.places, narrative: rest.narrative,
      keypoints: rest.keypoints, loot: rest.loot, gm_note: rest.gmnote,
      next_session: rest.next,
    };
    const { error } = num
      ? await sb.from('sessions').upsert(payload, { onConflict: 'num' })
      : await sb.from('sessions').insert(payload);
    if (error) throw error;
  },

  async saveCharacter(data) {
    const payload = {
      id: data.id, name: data.name, role: data.role, tag: data.tag,
      tag_class: data.tagClass, hero_text: data.hero, infobox: data.infobox,
      sections: data.sections, related: data.related,
    };
    const { error } = await sb.from('characters').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  },

  async saveTimelineEvent(data) {
    const payload = {
      sort_order: data.sort_order, is_era: data.is_era || false,
      era_label: data.era || null, year: data.year || null,
      label: data.label || null, title: data.title || null,
      description: data.desc || null, tag: data.tag || null, kind: data.kind || null,
    };
    if (data.id) {
      const { error } = await sb.from('timeline_events').update(payload).eq('id', data.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from('timeline_events').insert(payload);
      if (error) throw error;
    }
  },

  async saveDeity(data) {
    const payload = {
      id: data.id, tier: data.tier, tier_order: data.tier_order || 0,
      name: data.name, epithet: data.epithet, sigil: data.sigil,
      domain: data.domain, alignment: data.alignment,
      aligned: data.aligned || false, opposed: data.opposed || false,
      hero_text: data.hero, infobox: data.infobox,
      sections: data.sections, related: data.related,
    };
    const { error } = await sb.from('deities').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  },

  async saveLatestEntry(data) {
    const payload = {
      tag: data.tag, title: data.title, excerpt: data.excerpt,
      meta: data.meta, author: data.author, target: data.target,
      sort_order: data.sort_order || 0,
    };
    if (data.id) {
      const { error } = await sb.from('latest_entries').update(payload).eq('id', data.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from('latest_entries').insert(payload);
      if (error) throw error;
    }
  },

  async deleteRow(table, id) {
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) throw error;
  },
};
