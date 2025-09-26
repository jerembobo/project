import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useFacebookMCP } from '../hooks/useFacebookMCP';
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

const ConfigurationFacebook: React.FC = () => {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    access_token: '',
    ad_account_id: ''
  });
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const { authenticate, syncCampaigns, isLoading, isAuthenticated } = useFacebookMCP();

  const handleTestConnection = async () => {
    if (!credentials.access_token || !credentials.ad_account_id) {
      return;
    }

    setTesting(true);
    const success = await authenticate(credentials);
    setTestResult({ success });
    setTesting(false);

    if (success) {
      setStep(4);
    }
  };

  const handleSync = () => {
    syncCampaigns();
  };

  const steps = [
    {
      title: 'Accès Facebook Business',
      description: 'Connectez-vous à votre compte Facebook Business Manager'
    },
    {
      title: 'Génération du token',
      description: 'Créez un token d\'accès pour l\'API Marketing'
    },
    {
      title: 'Configuration compte publicitaire',
      description: 'Identifiez votre compte publicitaire Facebook'
    },
    {
      title: 'Synchronisation des campagnes',
      description: 'Importez vos données publicitaires dans KAPEHI'
    }
  ];

  return (
    <MainLayout 
      title="Configuration Facebook Ads" 
      subtitle="Connectez votre compte publicitaire Facebook en 4 étapes"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Steps */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Étape {step} sur 4
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((step / 4) * 100)}% terminé
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index + 1 <= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {index + 1 <= step ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-12 h-1 mx-2
                    ${index + 1 < step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `} />
                )}
              </div>
            ))}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {steps[step - 1].title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {steps[step - 1].description}
            </p>
          </div>
        </Card>

        {/* Step Content */}
        {step === 1 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📘 Accès Facebook Business Manager
            </h3>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Pour synchroniser vos campagnes Facebook Ads avec KAPEHI, vous devez générer 
                un token d'accès depuis Facebook Business Manager.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                  📋 Prérequis :
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Compte Facebook Business Manager actif</li>
                  <li>• Accès administrateur au compte publicitaire</li>
                  <li>• Campagnes Facebook Ads en cours ou passées</li>
                </ul>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-2"
                >
                  <span>Continuer</span>
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.open('https://business.facebook.com', '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ouvrir Business Manager</span>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔑 Génération du token d'accès
            </h3>
            
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                  ⚠️ Instructions importantes
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Suivez ces étapes dans Facebook Business Manager pour générer votre token.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Allez sur Facebook Graph API Explorer
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Rendez-vous sur developers.facebook.com/tools/explorer
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Générez un token utilisateur
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Sélectionnez les permissions : ads_read, ads_management, business_management
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Copiez le token généré
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Le token commence généralement par "EAA..." et est très long
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  Retour
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                >
                  J'ai mon token
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.open('https://developers.facebook.com/tools/explorer', '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Graph API Explorer</span>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔐 Configuration des identifiants
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Token d'accès Facebook
                </label>
                <textarea
                  placeholder="EAA..."
                  value={credentials.access_token}
                  onChange={(e) => setCredentials({...credentials, access_token: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Token généré depuis Facebook Graph API Explorer
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID du compte publicitaire
                </label>
                <input
                  type="text"
                  placeholder="123456789"
                  value={credentials.ad_account_id}
                  onChange={(e) => setCredentials({...credentials, ad_account_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Trouvez cet ID dans Business Manager → Comptes publicitaires (sans le préfixe "act_")
                </p>
              </div>
              
              {testResult && !testResult.success && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {testResult.error}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button 
                  variant="secondary"
                  onClick={() => setStep(2)}
                >
                  Retour
                </Button>
                <Button 
                  onClick={handleTestConnection}
                  loading={testing}
                  disabled={!credentials.access_token || !credentials.ad_account_id}
                >
                  Tester la connexion
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 4 && testResult?.success && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ✅ Connexion Facebook réussie !
            </h3>
            
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-medium text-green-800 dark:text-green-400">
                    Compte publicitaire connecté
                  </h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Compte: {testResult.account?.name} (ID: {testResult.account?.id})
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Synchronisation MCP des campagnes
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  KAPEHI va maintenant synchroniser vos campagnes Facebook Ads via MCP 
                  pour une performance optimale et une connexion directe aux API.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                    🔌 Avantages MCP Facebook :
                  </h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Accès direct aux API Facebook Marketing</li>
                    <li>• Synchronisation temps réel des métriques</li>
                    <li>• Gestion automatique des tokens et permissions</li>
                    <li>• Performance et fiabilité optimisées</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="secondary"
                  onClick={() => setStep(3)}
                >
                  Retour
                </Button>
                <Button 
                  onClick={handleSync}
                  loading={isLoading}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Synchroniser via MCP</span>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ConfigurationFacebook;