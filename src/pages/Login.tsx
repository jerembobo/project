import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite');
      console.error('Magic link error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    // Rediriger vers l'application en mode démo (sans authentification)
    window.location.href = '/dashboard';
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email envoyé !
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Nous avons envoyé un lien de connexion sécurisé à :
            </p>
            <p className="font-medium text-blue-600 dark:text-blue-400 mt-2">
              {email}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Étapes suivantes :</strong>
              </p>
              <ol className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>1. Vérifiez votre boîte mail</li>
                <li>2. Cliquez sur le lien de connexion</li>
                <li>3. Vous serez automatiquement connecté</li>
              </ol>
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
              className="w-full"
            >
              Renvoyer un email
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connexion à KAPEHI
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Accédez à votre tableau de bord e-commerce
          </p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              'Envoi en cours...'
            ) : (
              <>
                Envoyer le lien de connexion
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Vous voulez juste découvrir ?
            </p>
            <Button
              variant="secondary"
              onClick={handleDemoAccess}
              className="w-full"
            >
              Accéder en mode démonstration
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            En vous connectant, vous acceptez nos{' '}
            <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
              conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
              politique de confidentialité
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;