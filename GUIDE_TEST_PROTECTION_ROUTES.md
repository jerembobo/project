# Guide de Test - Protection des Routes

## 🎯 Objectif
Valider que la protection des routes fonctionne correctement selon les rôles utilisateur.

## 🧪 Tests à effectuer

### 1. Test en mode non authentifié (prospect/demo)

**URLs à tester :**
- ✅ `http://localhost:5173/dashboard` → Doit fonctionner (mode démo)
- ✅ `http://localhost:5173/preconisations-facebook` → Doit fonctionner (mode démo)
- ⚠️ `http://localhost:5173/connexion-plateformes` → Doit afficher la page mais avec limitations
- ❌ `http://localhost:5173/clients` → Doit afficher page d'erreur 403
- ❌ `http://localhost:5173/agency` → Doit afficher page d'erreur 403

**Résultats attendus :**
- Pages business : Accessibles en mode démo avec données mock
- Pages admin : Bloquées avec message d'erreur approprié
- Bouton "Se connecter" visible dans la sidebar

### 2. Test avec utilisateur authentifié (role: pro)

**Prérequis :** Se connecter via Magic Link

**URLs à tester :**
- ✅ `http://localhost:5173/dashboard` → Doit fonctionner
- ✅ `http://localhost:5173/connexion-plateformes` → Doit fonctionner avec toutes les fonctionnalités
- ❌ `http://localhost:5173/clients` → Doit afficher page d'erreur 403
- ❌ `http://localhost:5173/agency` → Doit afficher page d'erreur 403

**Résultats attendus :**
- Pages business : Accessibles avec données réelles
- Pages admin : Bloquées avec message d'erreur approprié
- Informations utilisateur visibles dans la sidebar

### 3. Test avec administrateur d'agence (role: agency_admin)

**Prérequis :** Configurer un utilisateur avec le rôle `agency_admin` dans la base

**URLs à tester :**
- ✅ `http://localhost:5173/dashboard` → Doit fonctionner
- ✅ `http://localhost:5173/connexion-plateformes` → Doit fonctionner
- ✅ `http://localhost:5173/clients` → Doit fonctionner
- ✅ `http://localhost:5173/agency` → Doit fonctionner

**Résultats attendus :**
- Toutes les pages accessibles
- Menu complet avec options d'administration
- Context switcher visible

### 4. Test avec administrateur plateforme (role: platform_admin)

**Prérequis :** Configurer un utilisateur avec le rôle `platform_admin` dans la base

**URLs à tester :**
- ✅ Toutes les pages → Doivent fonctionner
- ✅ Toggle "View As" → Doit être visible et fonctionnel

## 🔧 Configuration des utilisateurs de test

### Créer un agency_admin
```sql
-- Exécuter dans Supabase SQL Editor
INSERT INTO tenants_users (user_id, tenant_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'votre-email@example.com'),
  (SELECT id FROM tenants LIMIT 1),
  'agency_admin'
);
```

### Créer un platform_admin
```sql
-- Exécuter dans Supabase SQL Editor
INSERT INTO tenants_users (user_id, tenant_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'votre-email@example.com'),
  (SELECT id FROM tenants LIMIT 1),
  'platform_admin'
);
```

## ✅ Checklist de validation

### Protection des routes
- [ ] Pages publiques accessibles sans authentification
- [ ] Pages protégées bloquées pour les rôles insuffisants
- [ ] Messages d'erreur appropriés et informatifs
- [ ] Boutons de navigation fonctionnels dans les pages d'erreur

### Expérience utilisateur
- [ ] Transitions fluides entre les pages
- [ ] Messages d'erreur clairs et utiles
- [ ] Boutons d'action appropriés (Retour, Tableau de bord, Se connecter)
- [ ] Design cohérent avec le reste de l'application

### Sécurité
- [ ] Impossible de contourner la protection côté client
- [ ] Vérifications côté serveur via RLS
- [ ] Pas de fuite d'informations sensibles dans les erreurs

## 🐛 Problèmes potentiels

### Si les pages protégées sont accessibles :
1. Vérifier que `ProtectedRoute` est bien importé
2. Vérifier que les routes sont bien wrappées
3. Vérifier les props `requiredRole` et `requiredPage`

### Si les erreurs 403 ne s'affichent pas :
1. Vérifier que la route `/403` est configurée
2. Vérifier l'import de `Forbidden`
3. Vérifier la logique dans `ProtectedRoute`

### Si l'authentification ne fonctionne pas :
1. Vérifier la configuration Supabase
2. Vérifier les variables d'environnement
3. Vérifier les callbacks d'authentification

## 📝 Notes

- La protection est **additive** : un `platform_admin` peut accéder à toutes les pages
- Le mode démo permet de voir les pages mais limite les actions
- Les vérifications côté serveur (RLS) sont la vraie sécurité
- La protection côté client améliore l'UX mais n'est pas suffisante seule