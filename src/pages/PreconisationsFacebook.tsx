import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Target, TrendingUp, Users, Image, DollarSign, Clock, BarChart, Filter } from 'lucide-react';

const PreconisationsFacebook: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'Toutes', icon: BarChart },
    { id: 'audience', name: 'Audience', icon: Users },
    { id: 'budget', name: 'Budget', icon: DollarSign },
    { id: 'creative', name: 'Créatifs', icon: Image },
    { id: 'timing', name: 'Timing', icon: Clock },
    { id: 'optimization', name: 'Optimisation', icon: TrendingUp },
    { id: 'targeting', name: 'Ciblage', icon: Target }
  ];

  const recommendations = [
    {
      id: 1,
      category: 'audience',
      title: 'Élargir l\'audience Lookalike 1%',
      description: 'Vos audiences lookalike 1% montrent un excellent ROAS de 4.8x. Considérez l\'élargissement à 2% pour augmenter la portée.',
      impact: 'high',
      estimatedRoi: 2350,
      currentMetrics: { roas: 4.8, ctr: 2.3, cpa: 12.50 },
      status: 'pending'
    },
    {
      id: 2,
      category: 'budget',
      title: 'Redistribution du budget publicitaire',
      description: 'La campagne "Produits Premium" surperforme avec un ROAS de 6.2x. Augmentez son budget de 40%.',
      impact: 'high',
      estimatedRoi: 1890,
      currentMetrics: { roas: 6.2, ctr: 3.1, cpa: 8.90 },
      status: 'pending'
    },
    {
      id: 3,
      category: 'creative',
      title: 'Tester de nouveaux formats créatifs',
      description: 'Les vidéos courtes (15s) génèrent 35% plus d\'engagement que les images statiques.',
      impact: 'medium',
      estimatedRoi: 950,
      currentMetrics: { roas: 3.4, ctr: 2.8, cpa: 15.20 },
      status: 'implemented'
    },
    {
      id: 4,
      category: 'timing',
      title: 'Optimiser les plages horaires',
      description: 'Vos conversions sont 45% plus élevées entre 19h-22h. Concentrez 60% du budget sur cette période.',
      impact: 'medium',
      estimatedRoi: 1200,
      currentMetrics: { roas: 4.1, ctr: 2.6, cpa: 11.80 },
      status: 'pending'
    },
    {
      id: 5,
      category: 'optimization',
      title: 'Passer à l\'optimisation pour les achats',
      description: 'Votre campagne génère suffisamment de conversions (50+/semaine) pour optimiser directement les achats.',
      impact: 'high',
      estimatedRoi: 1750,
      currentMetrics: { roas: 3.8, ctr: 2.1, cpa: 16.40 },
      status: 'pending'
    },
    {
      id: 6,
      category: 'targeting',
      title: 'Exclure les audiences non-converties',
      description: 'Excluez les utilisateurs qui ont visité mais n\'ont pas converti depuis 30+ jours pour réduire le CPA.',
      impact: 'medium',
      estimatedRoi: 680,
      currentMetrics: { roas: 2.9, ctr: 1.8, cpa: 22.10 },
      status: 'rejected'
    }
  ];

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'rejected': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <MainLayout 
      title="Préconisations Facebook IA" 
      subtitle="Recommandations intelligentes pour optimiser vos campagnes Facebook Ads"
    >
      <div className="space-y-8">
        {/* Métriques Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">4.2x</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ROAS Moyen</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">2.4%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">CTR Moyen</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">€14.80</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">CPA Moyen</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">3.8%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taux Conversion</p>
            </div>
          </Card>
        </div>

        {/* Filtres par Catégorie */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filtrer par Catégorie
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredRecommendations.length} recommandation(s)
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Liste des Recommandations */}
        <div className="space-y-6">
          {filteredRecommendations.map((rec) => (
            <Card key={rec.id} hover>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {rec.title}
                      </h4>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(rec.impact)}`}>
                          Impact {rec.impact}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rec.status)}`}>
                          {rec.status === 'pending' ? 'En attente' : rec.status === 'implemented' ? 'Implémenté' : 'Rejeté'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {rec.description}
                  </p>
                  
                  {/* Métriques Actuelles */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500 dark:text-gray-400">ROAS:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {rec.currentMetrics.roas}x
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500 dark:text-gray-400">CTR:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {rec.currentMetrics.ctr}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500 dark:text-gray-400">CPA:</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        €{rec.currentMetrics.cpa}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="lg:ml-8 flex flex-col lg:items-end space-y-3">
                  <div className="text-center lg:text-right">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +€{rec.estimatedRoi}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ROI Estimé</p>
                  </div>
                  
                  {rec.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button variant="primary" size="sm">
                        Implémenter
                      </Button>
                      <Button variant="secondary" size="sm">
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune recommandation trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aucune recommandation disponible pour cette catégorie.
              </p>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default PreconisationsFacebook;