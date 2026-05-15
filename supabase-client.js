// Inicialização do cliente Supabase
const SUPABASE_URL  = 'https://hqkvfvlodphzzxyvwwvs.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxa3ZmdmxvZHBoenp4eXZ3d3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTIwODksImV4cCI6MjA5NDQyODA4OX0.yuB4PZG1rz9YaCR7mphC0EEmXzMe5BSyMM-qAQBvPNM';

try {
  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
} catch(e) {
  console.error('Supabase init failed:', e);
  // Fallback: objeto vazio que não quebra o resto do app
  window.sb = {
    from: () => ({ select: () => Promise.resolve({ data: [], error: null }), order: () => ({ data: [], error: null }) }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase indisponível' } }),
      signOut: () => Promise.resolve({}),
    },
  };
}
