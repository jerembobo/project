/*
  # Architecture Tenant-Ready pour KAPEHI

  1. Tables principales
    - `tenants` - Gestion des tenants (demo/customer)
    - `tenants_users` - Association utilisateurs/tenants avec rôles
    - `shopify_credentials` - Identifiants Shopify chiffrés par tenant
    - `sync_runs` - Audit et reprise des synchronisations

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques basées sur l'appartenance au tenant
    - Lecture seule pour les tenants demo

  3. Types stables
    - Énums pour éviter les strings libres
    - Contraintes de validation strictes
*/

-- Types énumérés stables
CREATE TYPE tenant_type AS ENUM ('demo', 'customer');
CREATE TYPE user_role AS ENUM ('platform_admin', 'tenant_admin', 'member');
CREATE TYPE sync_kind AS ENUM ('full', 'delta');
CREATE TYPE sync_status AS ENUM ('pending', 'running', 'success', 'failed', 'canceled');
CREATE TYPE app_mode AS ENUM ('DEMO', 'ONBOARDING', 'PRODUCTION');

-- Table des tenants
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type tenant_type NOT NULL DEFAULT 'customer',
  shopify_connected boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Association utilisateurs/tenants avec rôles
CREATE TABLE IF NOT EXISTS tenants_users (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

-- Identifiants Shopify chiffrés (côté serveur uniquement)
CREATE TABLE IF NOT EXISTS shopify_credentials (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  shop_domain text NOT NULL,
  admin_token_encrypted text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Audit et reprise des synchronisations
CREATE TABLE IF NOT EXISTS sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  kind sync_kind NOT NULL,
  status sync_status NOT NULL DEFAULT 'pending',
  counts jsonb NOT NULL DEFAULT '{}',
  error_details jsonb,
  estimated_total integer,
  last_cursor text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_by uuid REFERENCES auth.users(id)
);

-- Overrides de mode (optionnel, utile pour debug)
CREATE TABLE IF NOT EXISTS mode_overrides (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  target_mode app_mode NOT NULL,
  by_user uuid NOT NULL REFERENCES auth.users(id),
  reason text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Mise à jour des tables existantes pour supporter les tenants
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_tenants_users_user_id ON tenants_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_users_tenant_id ON tenants_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_runs_tenant_status ON sync_runs(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_sync_runs_created_at ON sync_runs(created_at DESC);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_shopify_credentials_updated_at
  BEFORE UPDATE ON shopify_credentials
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- RLS (Row Level Security)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode_overrides ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour tenants
CREATE POLICY "Users can read their tenants"
  ON tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = tenants.id 
      AND tu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tenants"
  ON tenants FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Tenant admins can update their tenant"
  ON tenants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = tenants.id 
      AND tu.user_id = auth.uid()
      AND tu.role IN ('platform_admin', 'tenant_admin')
    )
  );

-- Politiques RLS pour tenants_users
CREATE POLICY "Users can read their tenant memberships"
  ON tenants_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can manage memberships"
  ON tenants_users FOR ALL
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = tenants_users.tenant_id 
      AND tu.user_id = auth.uid()
      AND tu.role IN ('platform_admin', 'tenant_admin')
    )
  );

-- Politiques RLS pour shopify_credentials
CREATE POLICY "Tenant members can read credentials"
  ON shopify_credentials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = shopify_credentials.tenant_id 
      AND tu.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage credentials"
  ON shopify_credentials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = shopify_credentials.tenant_id 
      AND tu.user_id = auth.uid()
      AND tu.role IN ('platform_admin', 'tenant_admin')
    )
  );

-- Politiques RLS pour sync_runs
CREATE POLICY "Tenant members can read sync runs"
  ON sync_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = sync_runs.tenant_id 
      AND tu.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage sync runs"
  ON sync_runs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = sync_runs.tenant_id 
      AND tu.user_id = auth.uid()
      AND tu.role IN ('platform_admin', 'tenant_admin')
    )
  );

-- Politiques RLS pour mode_overrides
CREATE POLICY "Platform admins can manage mode overrides"
  ON mode_overrides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = mode_overrides.tenant_id 
      AND tu.user_id = auth.uid()
      AND tu.role = 'platform_admin'
    )
  );

-- Mise à jour des politiques existantes pour inclure tenant_id
DROP POLICY IF EXISTS "Users can read own data" ON profiles;
CREATE POLICY "Users can read own data"
  ON profiles FOR SELECT
  USING (
    id = auth.uid() OR
    (tenant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = profiles.tenant_id 
      AND tu.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (
    id = auth.uid() OR
    (tenant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = profiles.tenant_id 
      AND tu.user_id = auth.uid()
      AND tu.role IN ('platform_admin', 'tenant_admin')
    ))
  );

-- Fonction pour créer un tenant démo
CREATE OR REPLACE FUNCTION create_demo_tenant()
RETURNS uuid AS $$
DECLARE
  demo_tenant_id uuid;
BEGIN
  -- Créer le tenant démo
  INSERT INTO tenants (type, shopify_connected, created_by)
  VALUES ('demo', false, auth.uid())
  RETURNING id INTO demo_tenant_id;
  
  -- Associer l'utilisateur au tenant démo
  INSERT INTO tenants_users (tenant_id, user_id, role)
  VALUES (demo_tenant_id, auth.uid(), 'member');
  
  RETURN demo_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le mode d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_mode(user_uuid uuid DEFAULT auth.uid())
RETURNS app_mode AS $$
DECLARE
  user_tenant_id uuid;
  tenant_type_val tenant_type;
  shopify_connected_val boolean;
  override_mode app_mode;
BEGIN
  -- Vérifier s'il y a un override actif
  SELECT mo.target_mode INTO override_mode
  FROM mode_overrides mo
  JOIN tenants_users tu ON tu.tenant_id = mo.tenant_id
  WHERE tu.user_id = user_uuid
    AND (mo.expires_at IS NULL OR mo.expires_at > now())
  LIMIT 1;
  
  IF override_mode IS NOT NULL THEN
    RETURN override_mode;
  END IF;
  
  -- Récupérer le tenant principal de l'utilisateur
  SELECT t.id, t.type, t.shopify_connected
  INTO user_tenant_id, tenant_type_val, shopify_connected_val
  FROM tenants t
  JOIN tenants_users tu ON tu.tenant_id = t.id
  WHERE tu.user_id = user_uuid
  ORDER BY 
    CASE WHEN t.type = 'customer' THEN 1 ELSE 2 END,
    t.created_at DESC
  LIMIT 1;
  
  -- Déterminer le mode
  IF user_tenant_id IS NULL OR tenant_type_val = 'demo' THEN
    RETURN 'DEMO';
  ELSIF NOT shopify_connected_val THEN
    RETURN 'ONBOARDING';
  ELSE
    RETURN 'PRODUCTION';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Données de seed pour la démo
INSERT INTO tenants (id, type, shopify_connected, created_by) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo',
  false,
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;

-- Produits de démo
INSERT INTO products (
  id, user_id, tenant_id, shopify_product_id, title, handle, price, cost, margin, 
  inventory, sales_30d, revenue_30d, created_at, updated_at
) VALUES 
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'demo_product_1',
  'Casque Gaming Pro RGB',
  'casque-gaming-pro-rgb',
  89.99,
  45.00,
  49.99,
  156,
  89,
  8009.11,
  now() - interval '1 day',
  now()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'demo_product_2',
  'Clavier Mécanique RGB',
  'clavier-mecanique-rgb',
  129.99,
  68.00,
  61.99,
  234,
  67,
  8709.33,
  now() - interval '2 days',
  now()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'demo_product_3',
  'Souris Gaming Wireless',
  'souris-gaming-wireless',
  69.99,
  32.00,
  37.99,
  89,
  124,
  8678.76,
  now() - interval '3 days',
  now()
) ON CONFLICT (user_id, shopify_product_id) DO NOTHING;