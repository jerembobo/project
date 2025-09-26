import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Configuration Supabase avec tes vraies données
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jnqbuywqrzaesqqkekpa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucWJ1eXdxcnphZXNxcWtla3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODM1NjUsImV4cCI6MjA3NDQ1OTU2NX0.qjiKzeUBBUvZ9Uctbmrr1WZ8sQKPt7gCseis7B3vepo';

// Logs de diagnostic
console.log('🔧 SUPABASE DIAGNOSTIC:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? '✅ Définie' : '❌ Manquante');
console.log('Variables env:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables Supabase manquantes!');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'Définie' : 'Manquante');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test de connexion au démarrage
supabase
  .from('profiles')
  .select('count')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Test connexion Supabase échoué:', error);
    } else {
      console.log('✅ Supabase connecté avec succès!');
    }
  })
  .catch(err => {
    console.error('💥 Erreur test Supabase:', err);
  });

// Service role client for admin operations
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'sbp_403e7a9888fbd5547169c0ea12d9bf2a0542096e';
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;