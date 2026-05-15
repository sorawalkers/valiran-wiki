// Inicialização do cliente Supabase
// Exposto como window.sb para uso em todo o projeto

const SUPABASE_URL  = 'https://hqkvfvlodphzzxyvwwvs.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxa3ZmdmxvZHBoenp4eXZ3d3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTIwODksImV4cCI6MjA5NDQyODA4OX0.yuB4PZG1rz9YaCR7mphC0EEmXzMe5BSyMM-qAQBvPNM';

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
