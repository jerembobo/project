-- ✅ SCRIPT SÉCURISÉ - Configuration Platform Admin
-- ⚠️ PRÉREQUIS : L'utilisateur doit DÉJÀ exister dans auth.users
-- Créer l'utilisateur via : Supabase Dashboard → Authentication → Users → Add user

-- Paramètre : modifier l'email selon besoin
\set admin_email 'jeremy.boleis@gmail.com'

-- 1. Créer le tenant "platform" (idempotent)
INSERT INTO tenants (
  id, 
  name, 
  type, 
  category, 
  parent_tenant_id,
  shopify_connected,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), 
  'KAPEHI Platform', 
  'customer', 
  'agency', 
  null,
  false,
  now(),
  now()
) ON CONFLICT (name) DO NOTHING;

-- 2. Upsert rôle platform_admin dans tenants_users (source de vérité actuelle)
WITH platform_tenant AS (
  SELECT id FROM tenants WHERE name = 'KAPEHI Platform' LIMIT 1
), admin_user AS (
  SELECT id FROM auth.users WHERE email = :'admin_email' LIMIT 1
)
INSERT INTO tenants_users (
  id,
  tenant_id, 
  user_id, 
  role, 
  allowed_pages, 
  features,
  status,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  pt.id, 
  au.id, 
  'platform_admin',
  '["*"]'::jsonb,
  jsonb_build_object(
    'view_as', true,
    'admin_panel', true,
    'system_management', true,
    'manage_tenants', true,
    'manage_users', true,
    'full_access', true
  ),
  'active',
  now(),
  now()
FROM platform_tenant pt, admin_user au
ON CONFLICT (tenant_id, user_id) DO UPDATE SET
  role = excluded.role,
  allowed_pages = excluded.allowed_pages,
  features = excluded.features,
  status = 'active',
  updated_at = now();

-- 3. Vérification
SELECT 
  '✅ Configuration terminée' as status,
  u.email,
  tu.role,
  tu.allowed_pages,
  tu.features,
  t.name as tenant_name
FROM tenants_users tu
JOIN auth.users u ON u.id = tu.user_id
JOIN tenants t ON t.id = tu.tenant_id
WHERE u.email = :'admin_email';

-- 4. Vérification que l'utilisateur existe dans auth.users
DO $$
DECLARE
  user_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = 'jeremy.boleis@gmail.com'
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE NOTICE '⚠️  ATTENTION : Utilisateur jeremy.boleis@gmail.com non trouvé dans auth.users';
    RAISE NOTICE '📋 ÉTAPES REQUISES :';
    RAISE NOTICE '   1. Aller sur Supabase Dashboard → Authentication → Users';
    RAISE NOTICE '   2. Cliquer "Add user"';
    RAISE NOTICE '   3. Email: jeremy.boleis@gmail.com';
    RAISE NOTICE '   4. Laisser le mot de passe vide (Magic Link recommandé)';
    RAISE NOTICE '   5. Cocher "Auto Confirm User"';
    RAISE NOTICE '   6. Relancer ce script';
  ELSE
    RAISE NOTICE '✅ Utilisateur trouvé dans auth.users';
  END IF;
END $$;