import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle, AlertCircle, Settings, ExternalLink, RefreshCw } from 'lucide-react';

const ConnexionPlateformes: React.FC = () => {
  const { profile } = useAuth();

  const platforms = [
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Synchronisez vos produits, commandes et données de vente',
      icon: '🛍️',
      status: profile?.shopify_store_url ? 'connected' : 'disconnected',
      configUrl: '/configuration-shopify',
      data: profile?.shopify_store_url ? {
        store_url: profile.shopify_store_url,
        last_sync: '2024-01-15 14:30'
      } : null
    },
    {
      id: 'facebook',
      name: 'Facebook Ads',
      description: 'Importez vos campagnes, métriques et performances publicitaires',
      icon: '📘',
      status: profile?.facebook_ad_account_id ? 'connected' : 'disconnected',
      configUrl: '/configuration-facebook',
      data: profile?.facebook_ad_account_id ? {
        account_id: profile.facebook_ad_account_id,
        last_sync: '2024-01-15 14:25'
      } : null
    },
    {
      id: 'tiktok',
      name: 'TikTok Ads',
      description: 'Connectez vos campagnes TikTok for Business',
      icon: '🎵',
      status: 'coming_soon',
      configUrl: '#',
      data: null
    },
    {
      id: 'google',
      name: 'Google Ads',
      description: 'Synchronisez vos campagnes Google Ads et Analytics',
      icon: '🔍',
      status: 'coming_soon',
      configUrl: '#',
      data: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 dark:text-green-400';
      case 'disconnected': return 'text-red-600 dark:text-red-400';
      case 'coming_soon': return 'text-gray-500 dark:text-gray-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'disconnected': return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'coming_soon': return <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connecté';
      case 'disconnected': return 'Non connecté';
      case 'coming_soon': return 'Bientôt disponible';
      default: return 'Statut inconnu';
    }
  };

  const connectedPlatforms = platforms.filter(p => p.status === 'connected').length;
  const totalPlatforms = platforms.filter(p => p.status !== 'coming_soon').length;

  return (
    <MainLayout 
      title="Connexion Plateformes" 
      subtitle="Gérez vos intégrations avec les plateformes e-commerce et publicitaires"
    >
      <div className="space-y-8">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {connectedPlatforms}/{totalPlatforms}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plateformes connectées</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {profile?.shopify_store_url ? '✅' : '❌'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">E-commerce</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {profile?.facebook_ad_account_id ? '✅' : '❌'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Publicité</p>
            </div>
          </Card>
        </div>

        {/* Platforms List */}
        <div className="space-y-6">
          {platforms.map((platform) => (
            <Card key={platform.id} hover>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{platform.icon}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {platform.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(platform.status)}
                        <span className={`text-sm font-medium ${getStatusColor(platform.status)}`}>
                          {getStatusText(platform.status)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {platform.description}
                    </p>
                    
                    {platform.data && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Informations de connexion :
                        </h4>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {platform.id === 'shopify' && platform.data.store_url && (
                            <p>Boutique: {platform.data.store_url}</p>
                          )}
                          {platform.id === 'facebook' && platform.data.account_id && (
                            <p>Compte publicitaire: {platform.data.account_id}</p>
                          )}
                          <p>Dernière synchronisation: {platform.data.last_sync}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 lg:ml-6">
                  {platform.status === 'connected' && (
                    <>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Resynchroniser</span>
                      </Button>
                      <Link to={platform.configUrl}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="w-full flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Configurer</span>
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {platform.status === 'disconnected' && (
                    <Link to={platform.configUrl}>
                      <Button 
                        className="flex items-center space-x-2"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Connecter</span>
                      </Button>
                    </Link>
                  )}
                  
                  {platform.status === 'coming_soon' && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      disabled
                    >
                      Bientôt disponible
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Aide et Support
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Problèmes de connexion ?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Vérifiez que vous avez les bonnes permissions et que vos tokens d'accès sont valides.
              </p>
              <Button variant="secondary" size="sm">
                Guide de dépannage
              </Button>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Besoin d'aide ?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Notre équipe support est là pour vous accompagner dans la configuration.
              </p>
              <Button variant="secondary" size="sm">
                Contacter le support
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ConnexionPlateformes;