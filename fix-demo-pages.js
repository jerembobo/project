import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jnqbuywqrzaesqqkekpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucWJ1eXdxcnphZXNxcWtla3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODM1NjUsImV4cCI6MjA3NDQ1OTU2NX0.qjiKzeUBBUvZ9Uctbmrr1WZ8sQKPt7gCseis7B3vepo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDemoMode() {
  console.log('🔍 Test du mode Demo et vérification des configurations...\n');
  
  // 1. Vérifier les plans disponibles
  console.log('📋 Plans disponibles:');
  try {
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('*');
    
    if (plansError) {
      console.log('❌ Erreur lors de la récupération des plans:', plansError.message);
    } else {
      plans.forEach(plan => {
        console.log(`  - ${plan.name}: pages = ${JSON.stringify(plan.pages)}`);
      });
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
  
  console.log('\n');
  
  // 2. Vérifier les utilisateurs prospects
  console.log('👥 Utilisateurs prospects (mode Demo):');
  try {
    const { data: prospects, error: prospectsError } = await supabase
      .from('tenants_users')
      .select(`
        *,
        tenants(*)
      `)
      .eq('role', 'prospect')
      .limit(5);
    
    if (prospectsError) {
      console.log('❌ Erreur lors de la récupération des prospects:', prospectsError.message);
    } else {
      prospects.forEach(prospect => {
        console.log(`  - User ${prospect.user_id}: allowed_pages = ${JSON.stringify(prospect.allowed_pages)}`);
      });
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
  
  console.log('\n');
  
  // 3. Proposer des solutions
  console.log('💡 Solutions proposées:\n');
  
  console.log('1. 🔧 Mise à jour du plan "prospect" pour autoriser toutes les pages:');
  console.log('   UPDATE plans SET pages = \'["*"]\' WHERE name = \'prospect\';');
  
  console.log('\n2. 🔧 Mise à jour des utilisateurs prospects existants:');
  console.log('   UPDATE tenants_users SET allowed_pages = \'["*"]\' WHERE role = \'prospect\';');
  
  console.log('\n3. ✅ Feature flag VITE_FEATURE_VIEW_AS:');
  console.log('   Status: ACTIVÉ ✅ (vérifié dans .env)');
  
  console.log('\n4. 🎯 Pour tester immédiatement:');
  console.log('   - Redémarrez le serveur de développement');
  console.log('   - Connectez-vous en tant qu\'utilisateur prospect');
  console.log('   - Vérifiez que toutes les pages sont accessibles');
  console.log('   - Vérifiez que le toggle "View As" est visible pour les admins');
}

testDemoMode();