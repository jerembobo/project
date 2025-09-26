# 🧪 Guide de Test - Flux d'Authentification et View As

## 📋 Prérequis

1. **Serveur de développement lancé** : `npm run dev`
2. **Supabase configuré** avec les variables d'environnement
3. **Email de test** accessible (pour recevoir le Magic Link)

## 🔄 Étapes de Test

### 1. Test du Mode Démo (Sans Authentification)

1. **Accéder à l'application** : http://localhost:5173
2. **Vérifier l'état initial** :
   - ✅ Badge "MODE DEMO" visible
   - ✅ Bannière jaune "Vous consultez des données simulées"
   - ✅ Bouton "Se connecter" en bas de la sidebar
   - ✅ Pas de toggle "View As" visible
   - ✅ Navigation complète accessible (toutes les pages)
   - ✅ Actions d'écriture bloquées

### 2. Test de la Connexion Magic Link

1. **Cliquer sur "Se connecter"** dans la sidebar
2. **Page de login** :
   - ✅ Formulaire avec champ email
   - ✅ Bouton "Envoyer le lien magique"
   - ✅ Bouton "Accès Démo" (retour au mode démo)

3. **Processus Magic Link** :
   - Entrer votre email (ex: `admin@kapehi.com`)
   - Cliquer "Envoyer le lien magique"
   - ✅ Message de confirmation affiché
   - ✅ Email reçu avec lien de connexion

4. **Callback d'authentification** :
   - Cliquer sur le lien dans l'email
   - ✅ Redirection vers `/auth/callback`
   - ✅ Page "Connexion en cours..."
   - ✅ Redirection automatique vers le dashboard

### 3. Test de l'État Authentifié

1. **Après connexion réussie** :
   - ✅ Profil utilisateur affiché en bas de sidebar
   - ✅ Bouton de déconnexion (icône Settings)
   - ✅ Badge de mode mis à jour selon le rôle

### 4. Configuration Platform Admin

**⚠️ Important** : Pour tester le toggle "View As", vous devez d'abord configurer votre utilisateur comme `platform_admin`.

1. **Aller dans Supabase Dashboard** → SQL Editor
2. **Exécuter le script** `setup-platform-admin.sql` :
   - Modifier l'email dans le script : remplacer `admin@kapehi.com` par votre email
   - Exécuter le script complet
   - ✅ Vérifier que l'utilisateur est créé avec le rôle `platform_admin`

### 5. Test du Toggle "View As" (Platform Admin)

1. **Se reconnecter** après la configuration platform_admin
2. **Vérifier la présence du toggle** :
   - ✅ Toggle "View As" visible dans le header
   - ✅ Options disponibles : Pro, Agency Admin, Client Viewer
   - ✅ Badge indiquant le mode actuel

3. **Tester les différents rôles** :
   
   **Mode "Pro"** :
   - ✅ Badge "MODE PRODUCTION" ou "MODE ONBOARDING"
   - ✅ Accès complet aux fonctionnalités
   - ✅ Pas de restrictions d'écriture
   
   **Mode "Agency Admin"** :
   - ✅ Pages agence visibles (Dashboard Agence, Gestion Clients)
   - ✅ Context Switcher visible
   - ✅ Fonctionnalités de gestion clients
   
   **Mode "Client Viewer"** :
   - ✅ Accès limité aux pages autorisées
   - ✅ Bannière "Vue Client - Accès Contrôlé"
   - ✅ Pas d'accès aux pages de configuration

### 6. Test de la Déconnexion

1. **Cliquer sur l'icône Settings** en bas de sidebar
2. **Vérifier le retour au mode démo** :
   - ✅ Retour au bouton "Se connecter"
   - ✅ Badge "MODE DEMO"
   - ✅ Bannière de démonstration

## 🐛 Dépannage

### Toggle "View As" ne s'affiche pas

1. **Vérifier le rôle dans la base** :
```sql
SELECT u.email, tu.role, tu.features
FROM auth.users u
JOIN tenants_users tu ON tu.user_id = u.id
WHERE u.email = 'votre-email@example.com';
```

2. **Vérifier la feature flag** :
   - Variable `VITE_FEATURE_VIEW_AS=true` dans `.env`

3. **Vérifier les logs du navigateur** :
   - Console → Rechercher erreurs d'authentification
   - Network → Vérifier les appels aux Edge Functions

### Problèmes de Magic Link

1. **Email non reçu** :
   - Vérifier la configuration SMTP dans Supabase
   - Vérifier les spams
   - Tester avec un autre email

2. **Erreur de callback** :
   - Vérifier l'URL de redirection dans Supabase Auth
   - Vérifier que `http://localhost:5173/auth/callback` est autorisé

## ✅ Checklist de Validation

- [ ] Mode démo fonctionne sans authentification
- [ ] Page de login accessible et fonctionnelle
- [ ] Magic Link envoyé et reçu
- [ ] Callback d'authentification réussi
- [ ] Profil utilisateur affiché après connexion
- [ ] Platform admin configuré dans la base
- [ ] Toggle "View As" visible pour platform_admin
- [ ] Simulation des différents rôles fonctionnelle
- [ ] Déconnexion ramène au mode démo

## 📊 Résultats Attendus

Avec cette implémentation, vous devriez avoir :

1. **Flux d'authentification complet** avec Supabase Magic Link
2. **Identification correcte des rôles** via JWT
3. **Toggle "View As" fonctionnel** pour les platform_admin
4. **Préservation du mode démo** pour les utilisateurs non authentifiés
5. **Sécurité renforcée** avec RLS et vérifications côté serveur