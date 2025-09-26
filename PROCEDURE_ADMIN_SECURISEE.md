# 🔐 Procédure Sécurisée - Création Platform Admin

## ⚠️ Règles de Sécurité

### ❌ **INTERDIT**
- ❌ Insertion directe dans `auth.users` via SQL
- ❌ Mots de passe faibles (`admin123!`, etc.)
- ❌ Service Role keys côté frontend
- ❌ Scripts qui touchent les tables d'authentification

### ✅ **AUTORISÉ**
- ✅ Création via Supabase Auth Dashboard
- ✅ Magic Link (recommandé)
- ✅ Admin API côté serveur uniquement
- ✅ Upsert dans `tenants_users` après création Auth

## 📋 Procédure Complète

### **Étape 1 : Créer l'utilisateur (Sécurisé)**

**Option A - Dashboard Supabase (Recommandé)**
1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner le projet `jnqbuywqrzaesqqkekpa`
3. **Authentication** → **Users** → **Add user**
4. **Email** : `jeremy.boleis@gmail.com`
5. **Mot de passe** : Laisser vide (Magic Link)
6. ✅ Cocher **"Auto Confirm User"**
7. Cliquer **"Create user"**

**Option B - Magic Link (Plus sécurisé)**
1. Aller sur http://localhost:5173/login
2. Entrer `jeremy.boleis@gmail.com`
3. Cliquer "Envoyer le lien magique"
4. Cliquer le lien reçu par email

### **Étape 2 : Assigner le rôle platform_admin**

1. **Aller dans SQL Editor** de Supabase
2. **Exécuter le script** `setup-platform-admin-secure.sql`
3. **Vérifier** que l'utilisateur apparaît dans les résultats

### **Étape 3 : Vérification complète**

1. **Se connecter** avec `jeremy.boleis@gmail.com`
2. **Vérifier dans l'UI** :
   - ✅ Email affiché dans le debug panel
   - ✅ Rôle serveur = `platform_admin`
   - ✅ `isPlatformAdmin = true`
   - ✅ `isRealPlatformAdmin = true`
   - ✅ Toggle "View As" visible (si `VITE_FEATURE_VIEW_AS=true`)
   - ✅ Appel `system.get_mode` retourne 200

## 🔍 Dépannage

### **Toggle "View As" invisible**
```sql
-- Vérifier le rôle dans la base
SELECT u.email, tu.role, tu.features
FROM tenants_users tu
JOIN auth.users u ON u.id = tu.user_id
WHERE u.email = 'jeremy.boleis@gmail.com';
```

### **Erreur "User not found"**
- Vérifier que l'utilisateur existe dans `auth.users`
- Recréer via Supabase Dashboard si nécessaire

### **system.get_mode erreur 500**
- Vérifier les logs Edge Function
- Vérifier que `tenants_users` contient bien l'entrée

## 📊 Source de Vérité Actuelle

- **Table utilisée** : `tenants_users` (confirmé dans `get_user_mode_extended`)
- **Fonction serveur** : `get_user_mode_extended` lit `tenants_users`
- **Context resolver** : `resolveContext.ts` lit `tenants_users` (variable nommée `memberships`)

## 🔄 Migration Future

**Note** : Le naming `memberships` dans le code alors qu'on lit `tenants_users` peut créer de la confusion.

**Plan pour plus tard** :
1. Créer une vraie table `memberships` avec la même structure
2. Migrer les données `tenants_users` → `memberships`
3. Mettre à jour les fonctions pour lire `memberships`
4. Supprimer `tenants_users` (ou la renommer)

## ✅ Checklist de Validation

- [ ] Utilisateur créé via Supabase Auth (pas SQL direct)
- [ ] Script sécurisé exécuté (seulement `tenants_users`)
- [ ] Connexion Magic Link fonctionnelle
- [ ] Rôle `platform_admin` confirmé dans la base
- [ ] Toggle "View As" visible dans l'UI
- [ ] Aucun script dangereux dans le repo
- [ ] Variables d'environnement sécurisées

## 🚨 En cas de Problème

1. **Supprimer** tous les scripts qui touchent `auth.users`
2. **Recréer** l'utilisateur via Dashboard uniquement
3. **Vérifier** les permissions RLS
4. **Tester** la chaîne complète Auth → JWT → Edge Function