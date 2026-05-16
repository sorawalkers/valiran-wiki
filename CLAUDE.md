# O Arquivo de Valiran

Wiki interativa de campanha de RPG de mesa. SPA em React carregada via CDN + Babel standalone (sem build step). Backend em Supabase para persistência de dados; o app renderiza com dados estáticos e enriquece em segundo plano via Supabase.

---

## Estrutura de arquivos

```
index.html              # Entry point — carrega scripts em ordem
styles.css              # Variáveis CSS, reset, layout base (topbar/sidebar/main)
styles-extra.css        # Estilos das páginas novas (feed, sessions, kingdoms, tl-*, event-*, etc.)
app.jsx                 # Roteamento de páginas + componente App + tweaks de paleta/densidade
chrome.jsx              # Banner, Topbar, Sidebar
auth.jsx                # AuthProvider, useAuth, LoginModal, AuthButton
data.jsx                # Dados estáticos globais (nav, pantheon, timeline, latest entries…)
data-entities.jsx       # window.Entities — sessões e personagens com conteúdo rico
sigils.jsx              # SVGs heráldicos (Sigil.*)
tweaks-panel.jsx        # Painel de tweaks flutuante (useTweaks, TweaksPanel, controles)
supabase-client.js      # Inicializa window.sb (cliente Supabase)
db.js                   # window.DB — loadAll() + métodos CRUD
image-slot.js           # Web component <image-slot> para upload de imagens por drag-and-drop
pages/
  portal.jsx            # Página inicial (hero + cards de destaque)
  pantheon.jsx          # Grade de deuses por tier
  deity-detail.jsx      # Perfil de divindade + infobox + seções
  article.jsx           # Artigo genérico (Ayael etc.)
  timeline.jsx          # Linha do tempo cronológica + modal de criação/delete
  events.jsx            # Eventos da era filtráveis + modal de criação
  map.jsx               # Mapa SVG interativo com painel de região
  kingdoms.jsx          # Grade de reinos
  factions.jsx          # Dossier de facções
  characters.jsx        # Grade de personagens (Dramatis Personae) + modal + delete
  character-detail.jsx  # Perfil de personagem + infobox + seções biográficas
  planes.jsx            # Diagrama cosmológico dos planos
  weave.jsx             # Artigo sobre a Trama Mágica
  recent.jsx            # Feed de adições recentes
  sessions.jsx          # Grade de sessões + detalhe + modal de criação/edição/delete
  houserules.jsx        # Regras da casa em formato docs
```

---

## Como o roteamento funciona

`app.jsx` mantém um estado `active` (string). IDs simples como `'pantheon'` ou compostos como `'character:kathryn'` ou `'session:23'`. O `switch` em `renderPage()` mapeia para o componente correto. Não há React Router — tudo é SPA de página única.

```js
// Exemplos de navegação
onNav('home')
onNav('character:kathryn')
onNav('session:23')
onNav('deity:bahamut')
```

---

## Autenticação e roles

`AuthProvider` (auth.jsx) usa Supabase Auth. Roles são lidos da tabela `profiles` (`viewer`, `editor`, `admin`). O hook `useAuth()` expõe `{ user, profile, isEditor, isAdmin }`. Componentes usam `isEditor` para mostrar botões de criar/editar/excluir.

---

## Banco de dados (Supabase)

### Tabelas

| Tabela            | Uso                                      |
|-------------------|------------------------------------------|
| `sessions`        | Diário de sessões (upsert por `num`)     |
| `characters`      | Personagens (upsert por `id` slug)       |
| `deities`         | Divindades (upsert por `id` slug)        |
| `timeline_events` | Eventos da linha do tempo (insert)       |
| `latest_entries`  | Entradas recentes do portal              |
| `regions`         | Regiões do mapa                          |
| `articles`        | Artigos genéricos                        |
| `profiles`        | Roles de usuário (`viewer/editor/admin`) |
| `events`          | Eventos da era (tabela separada)         |

### window.DB — métodos disponíveis

```js
DB.loadAll()                  // Carrega tudo do Supabase para window.Data e window.Entities
DB.saveSession(data)          // Upsert por num
DB.saveCharacter(data)        // Upsert por id
DB.saveTimelineEvent(data)    // Insert
DB.saveDeity(data)            // Upsert por id
DB.deleteSession(num)         // Delete por num
DB.deleteCharacter(id)        // Delete por id slug
DB.deleteTimelineEvent(id)    // Delete por PK (id Supabase)
```

---

## Dados estáticos vs. Supabase

O app **sempre renderiza com dados estáticos** de `data.jsx` e `data-entities.jsx`. O `loadAll()` roda em background e sobrescreve `window.Data` e `window.Entities` quando termina. Páginas que precisam reagir ao update do Supabase devem ler de `window.Entities` no momento do render ou usar estado local.

---

## Padrão de editor (CRUD)

Todos os modais de criação/edição seguem o mesmo padrão:

```
ComponenteFormModal({ initial, onClose, onSaved })
  initial = null          → modo criação
  initial = { ...data }   → modo edição
```

Delete usa confirmação em dois cliques (sem modal extra):
1. Clique → botão fica vermelho com "Confirmar exclusão"
2. Clique → executa, remove da UI

---

## CSS — variáveis principais

```css
--ink-deep, --ink-slate, --ink-slate-2, --ink-slate-3   /* fundos escuros */
--ink-line, --ink-line-soft                              /* bordas */
--gold, --gold-bright, --gold-dim                        /* dourado principal */
--wine, --wine-bright, --blood                           /* vinho/perigo */
--foam, --foam-dim                                       /* texto claro */
--parchment, --parchment-text, --parchment-soft          /* superfície pergaminho */
--necro, --planar                                        /* cores especiais */
```

Paletas alternativas via `data-palette="wine|planar|necro"` no `<html>`.  
Densidade via `data-density="compact|normal|loose"`.

**Importante:** `styles.css` contém as variáveis e o layout base. `styles-extra.css` contém os estilos das páginas novas. Ambos são necessários — não substitua um pelo outro.

---

## Tweaks

`useTweaks(defaults)` lê do bloco `/*EDITMODE-BEGIN*/.../*EDITMODE-END*/` em `app.jsx`. O painel flutuante (`TweaksPanel`) é ativado via `postMessage({ type: '__activate_edit_mode' })` pelo host.

---

## Sigils

Componentes SVG em `sigils.jsx` acessados via `Sigil.NomeDivindade`. Exemplos: `Sigil.Compass`, `Sigil.Raven`, `Sigil.Dragon`, `Sigil.Hand`, `Sigil.Sun`, `Sigil.Search`, `Sigil.Settings`.

---

## Ordem de carregamento dos scripts

A ordem em `index.html` é crítica — cada script depende dos anteriores:

1. React + ReactDOM + Babel (CDN)
2. `image-slot.js`
3. Supabase SDK (CDN) → `supabase-client.js` → `db.js`
4. `tweaks-panel.jsx` → `sigils.jsx` → `data.jsx` → `data-entities.jsx`
5. `auth.jsx` → `chrome.jsx`
6. `pages/*.jsx` (todas)
7. `app.jsx` (último — faz `ReactDOM.createRoot(...).render(...)`)
