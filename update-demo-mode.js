import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jnqbuywqrzaesqqkekpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucWJ1eXdxcnphZXNxcWtla3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg4MzU2NSwiZXhwIjoyMDc0NDU5NTY1fQ.LMAh7hG8xXTaW3WPAihFMwXuONzdKZOnxW2aZQxuJPI';

const supabase = createClient(supabaseUrl, supabaseKey);

const updateFunction = `
CREATE OR REPLACE FUNCTION get_user_mode_extended(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tenant_info record;
  subscription_info record;
  result jsonb;
BEGIN
  -- Récupérer les informations du tenant principal de l'utilisateur
  SELECT 
    t.id as tenant_id,
    t.type as tenant_type,
    t.category as tenant_category,
    t.parent_tenant_id,
    t.shopify_connected,
    tu.role,
    tu.allowed_pages,
    tu.features as user_features
  INTO user_tenant_info
  FROM tenants t
  JOIN tenants_users tu ON tu.tenant_id = t.id
  WHERE tu.user_id = user_uuid
  ORDER BY 
    CASE tu.role 
      WHEN 'platform_admin' THEN 1
      WHEN 'agency_admin' THEN 2
      WHEN 'tenant_admin' THEN 3
      ELSE 4
    END
  LIMIT 1;

  -- Si pas de tenant trouvé, mode démo avec accès à toutes les pages
  IF user_tenant_info IS NULL THEN
    RETURN jsonb_build_object(
      'mode', 'DEMO',
      'role', 'prospect',
      'source', 'mock',
      'tenant_id', null,
      'features', '{}',
      'allowed_pages', '["*"]',
      'capabilities', jsonb_build_object(
        'canWrite', false,
        'canExport', false,
        'canSync', false
      )
    );
  END IF;

  -- Récupérer les informations de subscription
  SELECT s.*, p.features as plan_features
  INTO subscription_info
  FROM subscriptions s
  JOIN plans p ON p.id = s.plan_id
  WHERE s.tenant_id = user_tenant_info.tenant_id;

  -- Déterminer le mode basé sur le rôle et l'état
  IF user_tenant_info.role = 'prospect' THEN
    result := jsonb_build_object(
      'mode', 'DEMO',
      'role', 'prospect',
      'source', 'mock',
      'capabilities', jsonb_build_object(
        'canWrite', false,
        'canExport', false,
        'canSync', false
      )
    );
  ELSIF subscription_info IS NULL OR subscription_info.status != 'active' THEN
    result := jsonb_build_object(
      'mode', 'DEMO',
      'role', user_tenant_info.role,
      'source', 'mock',
      'capabilities', jsonb_build_object(
        'canWrite', false,
        'canExport', false,
        'canSync', false
      )
    );
  ELSIF NOT user_tenant_info.shopify_connected THEN
    result := jsonb_build_object(
      'mode', 'ONBOARDING',
      'role', user_tenant_info.role,
      'source', 'database',
      'capabilities', jsonb_build_object(
        'canWrite', true,
        'canExport', false,
        'canSync', true
      )
    );
  ELSE
    result := jsonb_build_object(
      'mode', 'PRODUCTION',
      'role', user_tenant_info.role,
      'source', 'shopify_admin',
      'capabilities', jsonb_build_object(
        'canWrite', true,
        'canExport', true,
        'canSync', true
      )
    );
  END IF;

  -- Ajouter les informations contextuelles
  result := result || jsonb_build_object(
    'tenant_id', user_tenant_info.tenant_id,
    'tenant_category', user_tenant_info.tenant_category,
    'parent_tenant_id', user_tenant_info.parent_tenant_id,
    'allowed_pages', CASE 
      WHEN (result->>'mode')::text = 'DEMO' THEN '["*"]'::jsonb
      ELSE COALESCE(user_tenant_info.allowed_pages, '[]')
    END,
    'features', COALESCE(
      user_tenant_info.user_features || COALESCE(subscription_info.plan_features, '{}'),
      '{}'
    )
  );

  RETURN result;
END;
$$;
`;

async function updateDemoMode() {
  try {
    console.log('🔄 Mise à jour de la fonction get_user_mode_extended...');
    
    const { data, error } = await supabase.rpc('exec', {
      sql: updateFunction
    });
    
    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      // Essayons avec une approche différente
      const { data: directData, error: directError } = await supabase
        .from('_supabase_migrations')
        .select('*')
        .limit(1);
        
      if (directError) {
        console.error('❌ Impossible de se connecter à Supabase:', directError);
        return;
      }
      
      console.log('✅ Connexion Supabase OK, mais la fonction exec n\'est pas disponible');
      console.log('ℹ️  Vous devrez appliquer manuellement la fonction SQL mise à jour');
      return;
    }
    
    console.log('✅ Fonction mise à jour avec succès!');
    console.log('📄 Résultat:', data);
    
  } catch (err) {
    console.error('❌ Erreur:', err);
  }
}

updateDemoMode();