import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (type === 'magiclink' && accessToken && refreshToken) {
          // Définir la session avec les tokens reçus
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            setStatus('success');
            
            // Rediriger vers le dashboard après un court délai
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
          } else {
            throw new Error('Aucun utilisateur trouvé');
          }
        } else {
          // Vérifier si nous avons une session active
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }

          if (data.session) {
            setStatus('success');
            
            // Rediriger vers le dashboard après un court délai
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
          } else {
            throw new Error('Session non trouvée');
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Erreur d\'authentification');
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/login', { replace: true });
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connexion en cours...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Nous finalisons votre authentification
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connexion réussie !
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous allez être redirigé vers votre tableau de bord...
          </p>
          <Button onClick={handleGoToDashboard} className="w-full">
            Accéder au tableau de bord
          </Button>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Erreur de connexion
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Une erreur s'est produite lors de la connexion :
          </p>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              Réessayer la connexion
            </Button>
            <Button variant="secondary" onClick={handleGoToDashboard} className="w-full">
              Continuer en mode démo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default AuthCallback;