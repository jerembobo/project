# 📨 Message pour le Développeur

## Configuration Platform Admin - Approche Sécurisée

Salut ! 

Merci pour la confirmation : `get_user_mode_extended` lit bien `tenants_users`. 

**✅ Plan sécurisé validé :**

### 1. Création utilisateur (sécurisée)
Je crée l'utilisateur `jeremy.boleis@gmail.com` via **Supabase Auth Dashboard** (pas d'insert SQL direct).

**Étapes :**
- Dashboard → Authentication → Users → Add user
- Email: `jeremy.boleis@gmail.com`
- Mot de passe: vide (Magic Link recommandé)
- ✅ Auto Confirm User

### 2. Attribution rôle platform_admin

Peux-tu appliquer l'**upsert platform_admin** dans `tenants_users` pour `jeremy.boleis@gmail.com` avec le script ci-joint ?

**Fichier :** `setup-platform-admin-secure.sql`

**Permissions requises :**
- `allowed_pages = ["*"]`
- `features.view_as = true`
- `features.admin_panel = true`
- `features.system_management = true`

### 3. Vérification attendue

Après login, on doit voir :
- ✅ `role = platform_admin`
- ✅ `isPlatformAdmin = true`
- ✅ `isRealPlatformAdmin = true`
- ✅ Toggle "View As" visible (si `VITE_FEATURE_VIEW_AS=true`)

### 4. Nettoyage du naming

**PS :** On renomme les variables ambiguës (`"memberships"` → `"tenantUsers"`) pour éviter les confusions. La migration vers `memberships` sera planifiée ensuite.

**Fichiers concernés :**
- `supabase/functions/system-mode/resolveContext.ts` (variables `memberships` qui lisent `tenants_users`)
- Autres endroits où le naming peut induire en erreur

---

**Résumé :** Approche 100% sécurisée, pas de SQL direct dans `auth.users`, source de vérité `tenants_users` confirmée. 🔐

Merci ! 🚀