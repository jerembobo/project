import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAppMode } from '../hooks/useAppMode';
import { useViewAs } from '../hooks/useViewAs';
import { useShopifyMCP } from '../hooks/useShopifyMCP';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const ConfigurationShopify: React.FC = () => {
  const { currentUiRole, isViewAsActive } = useViewAs();
  const { canSync, isDemo, refreshMode, canWrite, role } = useAppMode(undefined, isViewAsActive ? currentUiRole : undefined);
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    shop_url: '',
    access_token: ''
  });
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const { authenticate, syncProducts, isLoading } = useShopifyMCP();

  const handleTestConnection = async () => {
    if (!credentials.shop_url || !credentials.access_token) {
      return;
    }

    if (!canWrite) {
      alert('Test de connexion non disponible en mode démo');
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
    if (!canWrite) {
      alert('Synchronisation non disponible en mode démo');
      return;
    }
    // Rafraîchir le mode après la synchronisation
    syncProducts();
    setTimeout(() => {
      refreshMode();
    }, 1000);
  };

  const steps = [
    {
      title: 'Accès à votre boutique Shopify',
      description: 'Connectez-vous à votre admin Shopify pour créer une app privée'
    },
    {
      title: 'Création de l\'app privée',
      description: 'Générez les clés API nécessaires pour la synchronisation'
    },
    {
      title: 'Configuration des permissions',
      description: 'Accordez les permissions de lecture pour produits et commandes'
    },
    {
      title: 'Test de connexion',
      description: 'Vérifiez que la connexion fonctionne correctement'
    },
    {
      title: 'Synchronisation initiale',
      description: 'Importez vos données Shopify dans KAPEHI'
    },
    {
      title: 'Configuration terminée',
      description: 'Votre boutique est maintenant connectée !'
    }
  ];

  // Vérification des autorisations
  if (role === 'client_viewer') {
    return (
      <MainLayout title="Accès Refusé" subtitle="Cette page n'est pas accessible avec votre rôle">
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Configuration non autorisée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Contactez votre agence pour configurer Shopify.
            </p>
          </div>
        </Card>
      </MainLayout>
    );
  }
  return (
    <MainLayout 
      title="Configuration Shopify" 
      subtitle="Connectez votre boutique Shopify en 6 étapes simples"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Avertissement mode démo */}
        {isDemo && (
          <Card>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  🚀
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">
                    Démonstration - Configuration Shopify
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    {role === 'prospect' 
                      ? 'Découvrez comment KAPEHI se connecte à votre boutique Shopify en quelques clics. Cette démo vous montre le processus complet avec des exemples réels.'
                      : 'Explorez le processus de configuration Shopify avec des données de démonstration.'
                    }
                  </p>
                  
                  {/* Exemples de boutiques démo */}
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-blue-100 dark:border-blue-700">
                    <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2 text-sm">
                      📊 Exemples de boutiques connectées :
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-blue-700 dark:text-blue-300">fashion-store.myshopify.com</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-blue-700 dark:text-blue-300">tech-gadgets.myshopify.com</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-blue-700 dark:text-blue-300">home-decor.myshopify.com</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-blue-700 dark:text-blue-300">sports-equipment.myshopify.com</span>
                      </div>
                    </div>
                  </div>
                  
                  {role === 'prospect' && (
                    <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-700">
                      <p className="text-xs text-yellow-800 dark:text-yellow-300">
                        💡 <strong>Passez Pro ou Agence</strong> pour connecter votre vraie boutique et synchroniser vos données en temps réel.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {/* Progress Steps */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Étape {step} sur 6
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((step / 6) * 100)}% terminé
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
              🏪 Accès à votre boutique Shopify
            </h3>
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                KAPEHI va maintenant synchroniser vos produits via MCP (Model Context Protocol).
                Cette nouvelle architecture offre une meilleure performance et fiabilité.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                  🔌 Avantages MCP :
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Connexion directe et sécurisée aux API</li>
                  <li>• Performance optimisée et latence réduite</li>
                  <li>• Gestion d'erreurs avancée</li>
                  <li>• Synchronisation temps réel</li>
                </ul>
              </div>
              
              {/* Exemples de données synchronisées en mode démo */}
              {isDemo && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-400 mb-3">
                    📈 Exemple de données synchronisées :
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">Produits (247 articles)</h5>
                      <ul className="text-green-600 dark:text-green-400 space-y-1">
                        <li>• T-shirt Premium - 29,99€</li>
                        <li>• Sneakers Sport - 89,99€</li>
                        <li>• Sac à dos Design - 45,99€</li>
                        <li>• Montre Connectée - 199,99€</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">Commandes (30 derniers jours)</h5>
                      <ul className="text-green-600 dark:text-green-400 space-y-1">
                        <li>• 156 commandes traitées</li>
                        <li>• CA: 12,450€ (+15%)</li>
                        <li>• Panier moyen: 79,80€</li>
                        <li>• Taux conversion: 3.2%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={() => setStep(2)}
                disabled={!canWrite && !isDemo}
                className="w-full sm:w-auto"
              >
                {!canWrite && !isDemo ? 'Configuration (Démo)' : 'Commencer la configuration'}
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔑 Création de l'app privée
            </h3>
            
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                  ⚠️ Instructions importantes
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Suivez ces étapes dans votre admin Shopify pour créer l'app privée.
                </p>
              </div>
              
              {/* Exemple visuel en mode démo */}
              {isDemo && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-3">
                    🎯 Exemple d'app créée :
                  </h4>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">K</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">KAPEHI Integration</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">App privée • Créée le 15 Jan 2024</p>
                      </div>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      ✅ Permissions configurées: Produits (lecture), Commandes (lecture), Clients (lecture)
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Allez dans Paramètres → Apps et canaux de vente
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Dans votre admin Shopify, naviguez vers la section des applications
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Cliquez sur "Développer des apps"
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Puis "Créer une app" et donnez-lui le nom "KAPEHI Integration"
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Configurez les permissions API
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Accordez les permissions de lecture pour : Produits, Commandes, Clients
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  Retour
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!canWrite && !isDemo}
                >
                  {!canWrite && !isDemo ? 'Continuer (Démo)' : 'J\'ai créé l\'app'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔐 Saisie des identifiants
            </h3>
            
            <div className="space-y-6">
              {/* Exemple de credentials en mode démo */}
              {isDemo && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                    🎯 Exemple de configuration :
                  </h4>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <p><strong>URL:</strong> https://demo-fashion-store.myshopify.com</p>
                    <p><strong>Token:</strong> shpat_1a2b3c4d5e6f7g8h9i0j...</p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL de votre boutique
                </label>
                <input
                  type="url"
                  placeholder={isDemo ? "https://demo-fashion-store.myshopify.com" : "https://monshop.myshopify.com"}
                  value={isDemo ? "https://demo-fashion-store.myshopify.com" : credentials.shop_url}
                  onChange={(e) => !isDemo && setCredentials({...credentials, shop_url: e.target.value})}
                  disabled={!canWrite || isDemo}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Format: https://votre-boutique.myshopify.com
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Token d'accès Admin API
                </label>
                <input
                  type="password"
                  placeholder={isDemo ? "shpat_demo_token_configured" : "shpat_..."}
                  value={isDemo ? "shpat_demo_token_configured" : credentials.access_token}
                  onChange={(e) => !isDemo && setCredentials({...credentials, access_token: e.target.value})}
                  disabled={!canWrite || isDemo}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Trouvez ce token dans votre app privée → API credentials
                </p>
              </div>
              
              {testResult && !testResult.success && !isDemo && (
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
                  onClick={isDemo ? () => setStep(4) : handleTestConnection}
                  loading={testing && !isDemo}
                  disabled={!isDemo && (!credentials.shop_url || !credentials.access_token)}
                >
                  {isDemo ? 'Tester la connexion (Démo)' : (!canWrite ? 'Test (Démo)' : 'Tester la connexion')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {(step === 4 && (testResult?.success || isDemo)) && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ✅ Connexion réussie !
            </h3>
            
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-medium text-green-800 dark:text-green-400">
                    Boutique connectée avec succès
                  </h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Boutique: {isDemo ? "Demo Fashion Store" : testResult?.shop?.name} ({isDemo ? "demo-fashion-store.myshopify.com" : testResult?.shop?.domain})
                </p>
              </div>
              
              {/* Aperçu des données en mode démo */}
              {isDemo && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-3">
                    📊 Aperçu des données disponibles :
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">247</div>
                      <div className="text-blue-700 dark:text-blue-300">Produits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">156</div>
                      <div className="text-green-700 dark:text-green-300">Commandes (30j)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12.4k€</div>
                      <div className="text-purple-700 dark:text-purple-300">CA mensuel</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Prêt pour la synchronisation
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  KAPEHI va maintenant synchroniser vos produits et commandes des 30 derniers jours.
                  Cette opération peut prendre quelques minutes selon la taille de votre catalogue.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                    📊 Données qui seront synchronisées :
                  </h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Tous vos produits avec prix et stock</li>
                    <li>• Commandes des 30 derniers jours</li>
                    <li>• Calcul automatique des marges et performances</li>
                    <li>• Mise à jour en temps réel via webhooks</li>
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
                  onClick={isDemo ? () => setStep(5) : handleSync}
                  loading={isLoading && !isDemo}
                  disabled={!isDemo && !canSync}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isDemo ? 'Synchroniser (Démo)' : (!canWrite ? 'Sync (Démo)' : isDemo ? 'Synchronisation désactivée (démo)' : 'Synchroniser via MCP')}</span>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Nouvelle étape 5 pour le mode démo */}
        {step === 5 && isDemo && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎉 Synchronisation terminée !
            </h3>
            
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <h4 className="font-medium text-green-800 dark:text-green-400">
                    Synchronisation réussie en 2.3 secondes
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">247</div>
                    <div className="text-green-700 dark:text-green-300">Produits sync.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">156</div>
                    <div className="text-blue-700 dark:text-blue-300">Commandes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">1,247</div>
                    <div className="text-purple-700 dark:text-purple-300">Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">15</div>
                    <div className="text-orange-700 dark:text-orange-300">Collections</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-3">
                  🚀 Fonctionnalités maintenant disponibles :
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-blue-700 dark:text-blue-300">Audit des prix automatique</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-blue-700 dark:text-blue-300">Recommandations IA</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-blue-700 dark:text-blue-300">Analyse ROI en temps réel</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-blue-700 dark:text-blue-300">Optimisation des marges</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="secondary"
                  onClick={() => setStep(4)}
                >
                  Retour
                </Button>
                <Button 
                  onClick={() => setStep(6)}
                  className="flex items-center space-x-2"
                >
                  <span>Finaliser la configuration</span>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Étape 6 finale */}
        {step === 6 && isDemo && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ✨ Configuration terminée !
            </h3>
            
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="text-6xl mb-4">🎉</div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Votre boutique Shopify est maintenant connectée !
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Explorez toutes les fonctionnalités KAPEHI avec vos données synchronisées.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-4">
                  🎯 Prochaines étapes recommandées :
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-blue-700 dark:text-blue-300">Optimisation immédiate</h5>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Consultez l'audit des prix</li>
                      <li>• Analysez les recommandations IA</li>
                      <li>• Vérifiez le ROI Intelligence</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium text-blue-700 dark:text-blue-300">Configuration avancée</h5>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Connectez Facebook Ads</li>
                      <li>• Configurez les alertes</li>
                      <li>• Personnalisez les rapports</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1"
                >
                  Aller au Dashboard
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.location.href = '/audit-prix'}
                  className="flex-1"
                >
                  Voir l'audit des prix
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ConfigurationShopify;