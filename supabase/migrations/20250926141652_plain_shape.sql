/*
  # Extension RBAC/ABAC Multi-niveaux

  1. Hiérarchie de tenants (Agence → Clients)
  2. Rôles étendus (prospect, pro, agency_admin, client_viewer, platform_admin)
  3. Plans et subscriptions pour la facturation
  4. ABAC avec allowed_pages et features
  5. RLS hiérarchique pour les agences
*/

-- Extension de la table tenants pour la hiérarchie
ALTER TABLE tenants 
ADD COLUMN parent_tenant_id uuid REFERENCES tenants(id),
ADD COLUMN category text NOT NULL DEFAULT 'customer' 
  CHECK (category IN ('demo', 'customer', 'agency'));

-- Mise à jour du type pour inclure 'agency'
ALTER TABLE tenants 
DROP CONSTRAINT IF EXISTS tenants_type_check,
ADD CONSTRAINT tenants_type_check 
  CHECK (type IN ('demo', 'customer', 'agency'));

-- Extension des rôles dans tenants_users
ALTER TABLE tenants_users 
DROP CONSTRAINT IF EXISTS tenants_users_role_check,
ADD CONSTRAINT tenants_users_role_check 
  CHECK (role IN ('prospect', 'pro', 'agency_admin', 'client_viewer', 'tenant_admin', 'platform_admin'));

-- Ajout des colonnes ABAC
ALTER TABLE tenants_users 
ADD COLUMN allowed_pages jsonb NOT NULL DEFAULT '[]',
ADD COLUMN features jsonb NOT NULL DEFAULT '{}';

-- Table des plans produits
CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  features jsonb NOT NULL DEFAULT '{}',
  price_monthly decimal(10,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table des subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES plans(id),
  status text NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  seats integer NOT NULL DEFAULT 1,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS pour les nouvelles tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies pour plans (lecture publique pour les prospects)
CREATE POLICY "Plans are viewable by everyone" ON plans
  FOR SELECT USING (true);

-- Policies pour subscriptions (seulement les membres du tenant)
CREATE POLICY "Users can view their tenant subscription" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = subscriptions.tenant_id 
      AND tu.user_id = auth.uid()
    )
  );

-- Vue pour le scope hiérarchique (agence + ses clients)
CREATE OR REPLACE VIEW my_tenant_scope AS
SELECT DISTINCT t_child.id as tenant_id
FROM tenants t_child
JOIN tenants_users m_root ON m_root.user_id = auth.uid()
JOIN tenants t_root ON t_root.id = m_root.tenant_id
WHERE
  -- Son propre tenant
  t_child.id = t_root.id
  -- OU les clients si c'est une agence
  OR (t_root.category = 'agency' AND t_child.parent_tenant_id = t_root.id)
  -- OU si c'est platform_admin, tous les tenants
  OR m_root.role = 'platform_admin';

-- Mise à jour des policies existantes pour utiliser le scope hiérarchique
DROP POLICY IF EXISTS "Users can view their tenant products" ON products;
CREATE POLICY "Users can view their tenant scope products" ON products
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM my_tenant_scope));

DROP POLICY IF EXISTS "Users can manage their tenant products" ON products;
CREATE POLICY "Users can manage their tenant scope products" ON products
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM my_tenant_scope)
    AND EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = products.tenant_id 
      AND tu.user_id = auth.uid()
      AND tu.role IN ('agency_admin', 'tenant_admin', 'platform_admin')
    )
  );

-- Policies similaires pour campaigns
DROP POLICY IF EXISTS "Users can view their tenant campaigns" ON campaigns;
CREATE POLICY "Users can view their tenant scope campaigns" ON campaigns
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM my_tenant_scope));

DROP POLICY IF EXISTS "Users can manage their tenant campaigns" ON campaigns;
CREATE POLICY "Users can manage their tenant scope campaigns" ON campaigns
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM my_tenant_scope)
    AND EXISTS (
      SELECT 1 FROM tenants_users tu 
      WHERE tu.tenant_id = campaigns.tenant_id 
      AND tu.user_id = auth.uid()
      AND tu.role IN ('agency_admin', 'tenant_admin', 'platform_admin')
    )
  );

-- Fonction pour obtenir le mode utilisateur étendu avec RBAC
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

-- Seed des plans de base
INSERT INTO plans (id, name, description, features, price_monthly) VALUES
('prospect', 'Prospect', 'Accès démo uniquement', '{"pages": ["dashboard"], "clients_max": 0}', 0),
('pro_basic', 'Pro Basic', 'Accès complet pour un business', '{"pages": ["dashboard", "campaigns", "products", "analytics"], "exports": true, "clients_max": 0}', 49),
('agency_starter', 'Agency Starter', 'Gestion jusqu''à 5 clients', '{"pages": ["dashboard", "campaigns", "products", "analytics", "clients"], "exports": true, "clients_max": 5}', 149),
('agency_pro', 'Agency Pro', 'Gestion jusqu''à 20 clients', '{"pages": ["dashboard", "campaigns", "products", "analytics", "clients", "reports"], "exports": true, "clients_max": 20}', 299),
('platform_admin', 'Platform Admin', 'Accès administrateur complet', '{"pages": ["*"], "exports": true, "clients_max": -1, "admin": true}', 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  price_monthly = EXCLUDED.price_monthly;

-- Trigger pour mettre à jour updated_at sur subscriptions
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();