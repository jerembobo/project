import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TrendingUp, RefreshCw, CheckCircle, XCircle, AlertCircle, Zap } from 'lucide-react';

const Suggestions: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const suggestions = [
    {
      id: 1,
      title: 'Optimisation automatique des enchères pour Campagne Premium',
      description: 'L\'IA détecte que votre campagne Premium peut bénéficier d\'une optimisation des enchères automatique. Augmentation prévue du ROAS de 23%.',
      type: 'facebook',
      priority: 'high',
      impact: '+€2,340',
      confidence: 94,
      status: 'pending',
      data: {
        currentRoas: 4.2,
        expectedRoas: 5.2,
        currentCpa: 14.50,
        expectedCpa: 11.80
      }
    },
    {
      id: 2,
      title: 'Réajustement prix produit "Casque Gaming Pro"',
      description: 'Analyse Shopify + Facebook Ads révèle une opportunité d\'augmenter le prix de 8% sans impact négatif sur les conversions.',
      type: 'shopify',
      priority: 'medium',
      impact: '+€890',
      confidence: 87,
      status: 'pending',
      data: {
        currentPrice: 79.99,
        suggestedPrice: 86.39,
        conversionImpact: '0%',
        marginIncrease: '+8%'
      }
    },
    {
      id: 3,
      title: 'Nouvelle audience Lookalike basée sur les achats récents',
      description: 'Créer une audience lookalike 2% basée sur les 500 derniers acheteurs pour améliorer la prospection.',
      type: 'facebook',
      priority: 'high',
      impact: '+€1,560',
      confidence: 91,
      status: 'implemented',
      data: {
        baseAudience: 500,
        estimatedReach: '1.2M',
        expectedCtr: '3.1%',
        expectedRoas: '4.8x'
      }
    },
    {
      id: 4,
      title: 'Bundle produits complémentaires détecté',
      description: 'Les clients qui achètent "Clavier Mécanique" achètent aussi "Tapis de souris RGB" dans 67% des cas.',
      type: 'shopify',
      priority: 'medium',
      impact: '+€650',
      confidence: 78,
      status: 'pending',
      data: {
        correlation: '67%',
        bundleDiscount: '10%',
        expectedIncrease: '+15%',
        avgOrderValue: '+€24'
      }
    },
    {
      id: 5,
      title: 'Retargeting des abandons de panier optimisé',
      description: 'Nouvelle stratégie de retargeting avec séquence publicitaire sur 7 jours pour récupérer 31% d\'abandons supplémentaires.',
      type: 'facebook',
      priority: 'high',
      impact: '+€2,120',
      confidence: 89,
      status: 'pending',
      data: {
        currentRecovery: '12%',
        expectedRecovery: '43%',
        sequence: '7 jours',
        budgetOptimal: '€450'
      }
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulation d'une actualisation IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'facebook' ? '📘' : '🛍️';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <MainLayout 
      title="Recommandations IA Pub" 
      subtitle="IA avancée analysant Facebook Ads + Shopify pour suggestions d'optimisation en temps réel"
    >
      <div className="space-y-8">
        {/* Header avec actions */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Suggestions IA Auto-Optimisation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Dernière actualisation: Il y a 2 minutes • Confiance IA moyenne: 88%
              </p>
            </div>
            
            <Button 
              onClick={handleRefresh}
              loading={isRefreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser IA</span>
            </Button>
          </div>
        </Card>

        {/* Métriques de Performance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                +€7,560
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Impact Total Estimé</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                89%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confiance IA Moyenne</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                3
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Priorité Haute</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                1
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Déjà Implémenté</p>
            </div>
          </Card>
        </div>

        {/* Liste des Suggestions */}
        <div className="space-y-6">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} hover>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {suggestion.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(suggestion.priority)}`}>
                            Priorité {suggestion.priority}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Confiance IA: {suggestion.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {getStatusIcon(suggestion.status)}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {suggestion.description}
                  </p>
                  
                  {/* Données détaillées */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                      Données d'Analyse IA:
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      {Object.entries(suggestion.data).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {typeof value === 'string' ? value : `${value}`}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="lg:min-w-[200px] flex flex-col items-center lg:items-end space-y-3">
                  <div className="text-center lg:text-right">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {suggestion.impact}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Impact Estimé</p>
                  </div>
                  
                  {/* Barre de confiance */}
                  <div className="w-full lg:w-24">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Confiance</span>
                      <span>{suggestion.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${suggestion.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {suggestion.status === 'pending' && (
                    <div className="flex flex-col space-y-2 w-full lg:w-auto">
                      <Button variant="primary" size="sm" className="w-full lg:w-auto">
                        Implémenter
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full lg:w-auto">
                        Rejeter
                      </Button>
                    </div>
                  )}
                  
                  {suggestion.status === 'implemented' && (
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Implémenté</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Suggestions;