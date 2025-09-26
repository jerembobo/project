import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppMode } from '../../hooks/useAppMode';
import MainLayout from '../layout/MainLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { AlertCircle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'pro' | 'client_viewer' | 'agency_admin' | 'platform_admin';
  requiredPage?: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requiredRole,
  requiredPage,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, initialized } = useAuth();
  const { role, hasPageAccess, isDemo } = useAppMode();

  // Attendre l'initialisation
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirection vers login si authentification requise
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Vérification du rôle requis
  if (requiredRole && role !== requiredRole) {
    // Cas spéciaux pour les rôles hiérarchiques
    const roleHierarchy = {
      'platform_admin': ['platform_admin'],
      'agency_admin': ['platform_admin', 'agency_admin'],
      'pro': ['platform_admin', 'agency_admin', 'pro'],
      'client_viewer': ['platform_admin', 'agency_admin', 'pro', 'client_viewer']
    };

    const allowedRoles = roleHierarchy[requiredRole] || [requiredRole];
    
    if (!allowedRoles.includes(role)) {
      return (
        <MainLayout title="Accès Refusé" subtitle="Vous n'avez pas les permissions nécessaires">
          <Card>
            <div className="text-center py-12">
              <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Accès non autorisé
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Cette page nécessite le rôle "{requiredRole}" ou supérieur.
                <br />
                Votre rôle actuel : "{role}"
              </p>
              <div className="space-x-4">
                <Button 
                  variant="secondary" 
                  onClick={() => window.history.back()}
                >
                  Retour
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Tableau de bord
                </Button>
              </div>
            </div>
          </Card>
        </MainLayout>
      );
    }
  }

  // Vérification de l'accès à la page spécifique
  if (requiredPage && !hasPageAccess(requiredPage) && !hasPageAccess('*')) {
    return (
      <MainLayout title="Page Non Disponible" subtitle="Cette page n'est pas accessible avec votre configuration">
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Page non accessible
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cette page n'est pas incluse dans votre configuration actuelle.
              {isDemo && (
                <>
                  <br />
                  <span className="text-sm text-purple-600 dark:text-purple-400">
                    En mode démo, toutes les pages sont visibles mais certaines fonctionnalités sont limitées.
                  </span>
                </>
              )}
            </p>
            <div className="space-x-4">
              <Button 
                variant="secondary" 
                onClick={() => window.history.back()}
              >
                Retour
              </Button>
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/dashboard'}
              >
                Tableau de bord
              </Button>
            </div>
          </div>
        </Card>
      </MainLayout>
    );
  }

  // Si toutes les vérifications passent, afficher le contenu
  return <>{children}</>;
};

export default ProtectedRoute;