import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useAppMode } from '../hooks/useAppMode';
import { Shield, ArrowLeft, Home, LogIn } from 'lucide-react';

interface ForbiddenProps {
  title?: string;
  message?: string;
  requiredRole?: string;
  currentRole?: string;
}

const Forbidden: React.FC<ForbiddenProps> = ({
  title = "Accès Refusé",
  message = "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
  requiredRole,
  currentRole
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { role, isDemo } = useAppMode();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <MainLayout title={title} subtitle="Erreur d'autorisation">
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <div className="text-center py-12 px-6">
            {/* Icône */}
            <div className="mb-6">
              <Shield className="w-20 h-20 text-red-400 mx-auto" />
            </div>

            {/* Titre */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {title}
            </h1>

            {/* Message principal */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>

            {/* Détails des rôles si fournis */}
            {(requiredRole || currentRole || role) && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Détails des permissions :
                </h3>
                <div className="space-y-1 text-sm">
                  {requiredRole && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Rôle requis :</span> {requiredRole}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Votre rôle actuel :</span> {currentRole || role}
                  </p>
                  {isDemo && (
                    <p className="text-purple-600 dark:text-purple-400">
                      <span className="font-medium">Mode :</span> Démonstration
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions d'actions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">
                Que pouvez-vous faire ?
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 text-left space-y-1">
                {!isAuthenticated ? (
                  <li>• Connectez-vous avec un compte ayant les permissions appropriées</li>
                ) : (
                  <>
                    <li>• Contactez votre administrateur pour obtenir les permissions nécessaires</li>
                    <li>• Vérifiez que vous êtes connecté avec le bon compte</li>
                  </>
                )}
                <li>• Retournez au tableau de bord pour accéder aux pages autorisées</li>
                {isDemo && (
                  <li>• En mode démo, certaines fonctionnalités sont limitées par design</li>
                )}
              </ul>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={handleGoBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>

              <Button
                variant="primary"
                onClick={handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Tableau de bord
              </Button>

              {!isAuthenticated && (
                <Button
                  variant="success"
                  onClick={handleLogin}
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </Button>
              )}
            </div>

            {/* Code d'erreur */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Erreur 403 - Accès interdit
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Forbidden;