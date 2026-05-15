// auth.jsx — contexto de autenticação, modal de login, verificação de role

const { useState: useAuthState, useEffect: useAuthEffect, createContext, useContext } = React;

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser]       = useAuthState(null);
  const [profile, setProfile] = useAuthState(null);
  const [loading, setLoading] = useAuthState(true);

  useAuthEffect(() => {
    // Sessão atual
    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });

    // Listener de mudanças de auth
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(uid) {
    const { data } = await sb.from('profiles').select('*').eq('id', uid).single();
    setProfile(data);
    setLoading(false);
  }

  const isEditor = profile?.role === 'editor' || profile?.role === 'admin';
  const isAdmin  = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isEditor, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// ── Modal de login ───────────────────────────────────────────────────────────
function LoginModal({ onClose }) {
  const [email, setEmail]     = useAuthState('');
  const [password, setPass]   = useAuthState('');
  const [error, setError]     = useAuthState('');
  const [loading, setLoading] = useAuthState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { setError('Email ou senha incorretos.'); setLoading(false); }
    else onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-page)',
        border: '1px solid var(--gold-dim)',
        borderRadius: 4,
        padding: '48px 52px',
        width: 420,
        maxWidth: '90vw',
      }} onClick={e => e.stopPropagation()}>

        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--gold-dim)',
          marginBottom: 8,
        }}>O Arquivo de Valiran</div>

        <h2 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 22,
          color: 'var(--parchment)',
          margin: '0 0 32px',
          fontWeight: 400,
        }}>Acesso restrito</h2>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="arquivista@valiran.com"
            />
          </div>
          <div>
            <label style={labelStyle}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPass(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ color: '#c84b4b', fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.08em' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: '13px 0',
              background: 'transparent',
              border: '1px solid var(--gold-dim)',
              color: 'var(--gold-bright)',
              fontFamily: 'Cinzel, serif',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              borderRadius: 2,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Verificando...' : 'Entrar no arquivo'}
          </button>
        </form>

        <button onClick={onClose} style={{
          marginTop: 24,
          background: 'none',
          border: 'none',
          color: 'var(--foam-dim)',
          fontFamily: 'JetBrains Mono',
          fontSize: 10,
          letterSpacing: '0.16em',
          cursor: 'pointer',
          textTransform: 'uppercase',
          display: 'block',
          width: '100%',
          textAlign: 'center',
        }}>
          Fechar · continuar como leitor
        </button>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontFamily: 'JetBrains Mono',
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--foam-dim)',
  marginBottom: 8,
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--ink-line)',
  borderRadius: 2,
  color: 'var(--parchment)',
  fontFamily: 'EB Garamond, serif',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
};

// ── Botão de auth no topbar ──────────────────────────────────────────────────
function AuthButton() {
  const { user, profile, isEditor } = useAuth();
  const [showLogin, setShowLogin]   = useAuthState(false);

  async function logout() {
    await sb.auth.signOut();
  }

  if (!user) {
    return (
      <React.Fragment>
        <button onClick={() => setShowLogin(true)} style={authBtnStyle}>
          <span style={{ fontSize: 14, marginRight: 6 }}>⚿</span>
          Arquivista
        </button>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </React.Fragment>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: isEditor ? 'var(--gold-bright)' : 'var(--foam-dim)',
      }}>
        {profile?.role ?? 'viewer'} · {profile?.display_name ?? user.email.split('@')[0]}
      </span>
      <button onClick={logout} style={{ ...authBtnStyle, opacity: 0.7 }}>
        Sair
      </button>
    </div>
  );
}

const authBtnStyle = {
  padding: '6px 14px',
  background: 'transparent',
  border: '1px solid var(--gold-dim)',
  color: 'var(--gold-dim)',
  fontFamily: 'Cinzel, serif',
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  borderRadius: 2,
};

window.AuthProvider = AuthProvider;
window.useAuth     = useAuth;
window.AuthButton  = AuthButton;
window.LoginModal  = LoginModal;
