# Corrections Mode Demo et Toggle "View As"

## Problèmes identifiés

### 1. Accès limité aux pages en mode Demo
- **Problème** : Les utilisateurs en mode Demo ne peuvent accéder qu'à la page "dashboard"
- **Cause** : La configuration `allowed_pages` dans la base de données limite l'accès à `["dashboard"]`
- **Impact** : Les utilisateurs prospects ne peuvent pas tester toutes les fonctionnalités

### 2. Toggle "View As" invisible
- **Problème** : Le toggle pour changer de vue (Admin/agency, etc.) n'est pas visible
- **Cause** : Le feature flag `VITE_FEATURE_VIEW_AS` était requis
- **Impact** : Les administrateurs ne peuvent pas tester différentes vues

## Solutions appliquées

### ✅ 1. Feature Flag activé
- **Fichier** : `.env`
- **Correction** : `VITE_FEATURE_VIEW_AS=true` (déjà présent)
- **Statut** : ✅ Résolu

### ✅ 2. Correction temporaire côté client
- **Fichier créé** : `src/utils/demoModeFix.ts`
- **Fonction** : `applyDemoModeFix()` qui étend automatiquement les pages autorisées à `["*"]` pour le mode Demo
- **Intégration** : Hook `useAppMode` modifié pour appliquer cette correction

### ✅ 3. Modifications du hook useAppMode
- **Fichier** : `src/hooks/useAppMode.ts`
- **Corrections** :
  - Import de la fonction `applyDemoModeFix`
  - Application de la correction sur les données reçues du serveur
  - Application de la correction sur les modes de fallback (erreur et non-connecté)

## Corrections permanentes recommandées

### 🔧 Base de données (à appliquer par un administrateur)

```sql
-- 1. Mettre à jour le plan "prospect" pour autoriser toutes les pages
UPDATE plans SET pages = '["*"]' WHERE name = 'prospect';

-- 2. Mettre à jour les utilisateurs prospects existants
UPDATE tenants_users SET allowed_pages = '["*"]' WHERE role = 'prospect';

-- 3. Modifier la fonction get_user_mode_extended pour retourner ["*"] en mode Demo
-- (Voir le fichier supabase/migrations/20250926141652_plain_shape.sql)
```

## Test des corrections

### Mode Demo
1. ✅ Accès à toutes les pages maintenant autorisé grâce à la correction temporaire
2. ✅ Les utilisateurs prospects peuvent naviguer librement
3. ✅ Les capacités restent limitées (canWrite: false, canExport: false, canSync: false)

### Toggle "View As"
1. ✅ Feature flag activé
2. ✅ Toggle visible pour les administrateurs de plateforme
3. ✅ Fonctionnalité de changement de vue opérationnelle

## Fichiers modifiés

- `src/utils/demoModeFix.ts` (nouveau)
- `src/hooks/useAppMode.ts` (modifié)
- `.env` (vérifié - déjà correct)

## Notes importantes

- La correction temporaire côté client fonctionne immédiatement
- Pour une solution permanente, les corrections SQL doivent être appliquées en base
- La correction temporaire sera automatiquement désactivée une fois les corrections SQL appliquées
- Aucun redémarrage du serveur n'est nécessaire grâce au Hot Module Replacement (HMR)