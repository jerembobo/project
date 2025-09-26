-- Script pour créer un utilisateur platform_admin de test
-- À exécuter dans Supabase SQL Editor

-- 1. Créer un tenant de test pour l'admin plateforme
INSERT INTO tenants (id, name, type, category, shopify_connected)
VALUES (
  gen_random_uuid(),
  'KAPEHI Platform Admin',
  'customer',
  'customer',
  false
) ON CONFLICT DO NOTHING;

-- 2. Récupérer l'ID du tenant créé (ou utiliser un existant)
-- Remplacez 'admin@kapehi.com' par l'email que vous utiliserez pour vous connecter
DO $$
DECLARE
  admin_tenant_id uuid;
  admin_user_id uuid;
BEGIN
  -- Récupérer le tenant admin
  SELECT id INTO admin_tenant_id 
  FROM tenants 
  WHERE name = 'KAPEHI Platform Admin' 
  LIMIT 1;
  
  -- Récupérer l'utilisateur par email (remplacez par votre email)
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@kapehi.com'
  LIMIT 1;
  
  -- Si l'utilisateur existe, l'ajouter comme platform_admin
  IF admin_user_id IS NOT NULL AND admin_tenant_id IS NOT NULL THEN
    INSERT INTO tenants_users (tenant_id, user_id, role, allowed_pages, features)
    VALUES (
      admin_tenant_id,
      admin_user_id,
      'platform_admin',
      '["*"]'::jsonb,
      '{
        "view_as": true,
        "admin_panel": true,
        "system_management": true
      }'::jsonb
    ) ON CONFLICT (tenant_id, user_id) 
    DO UPDATE SET 
      role = 'platform_admin',
      allowed_pages = '["*"]'::jsonb,
      features = '{
        "view_as": true,
        "admin_panel": true,
        "system_management": true
      }'::jsonb;
      
    RAISE NOTICE 'Utilisateur % configuré comme platform_admin sur tenant %', admin_user_id, admin_tenant_id;
  ELSE
    RAISE NOTICE 'Utilisateur avec email admin@kapehi.com non trouvé. Connectez-vous d''abord avec Magic Link.';
  END IF;
END $$;

-- 3. Créer quelques tenants de test pour tester le View As
INSERT INTO tenants (id, name, type, category, shopify_connected)
VALUES 
  (gen_random_uuid(), 'Boutique Test 1', 'customer', 'customer', true),
  (gen_random_uuid(), 'Agence Marketing Pro', 'customer', 'agency', false),
  (gen_random_uuid(), 'Client Agence 1', 'customer', 'customer', true)
ON CONFLICT DO NOTHING;

-- 4. Créer des utilisateurs de test dans ces tenants
DO $$
DECLARE
  boutique_tenant_id uuid;
  agence_tenant_id uuid;
  client_tenant_id uuid;
BEGIN
  -- Récupérer les IDs des tenants de test
  SELECT id INTO boutique_tenant_id FROM tenants WHERE name = 'Boutique Test 1' LIMIT 1;
  SELECT id INTO agence_tenant_id FROM tenants WHERE name = 'Agence Marketing Pro' LIMIT 1;
  SELECT id INTO client_tenant_id FROM tenants WHERE name = 'Client Agence 1' LIMIT 1;
  
  -- Créer des utilisateurs fictifs pour les tests
  -- Note: Ces utilisateurs n'existent pas dans auth.users, c'est juste pour la structure
  
  RAISE NOTICE 'Tenants de test créés:';
  RAISE NOTICE 'Boutique Test 1: %', boutique_tenant_id;
  RAISE NOTICE 'Agence Marketing Pro: %', agence_tenant_id;
  RAISE NOTICE 'Client Agence 1: %', client_tenant_id;
END $$;

-- 5. Vérifier la configuration
SELECT 
  t.name as tenant_name,
  t.type,
  t.category,
  u.email,
  tu.role,
  tu.allowed_pages,
  tu.features
FROM tenants t
JOIN tenants_users tu ON tu.tenant_id = t.id
JOIN auth.users u ON u.id = tu.user_id
WHERE tu.role = 'platform_admin';