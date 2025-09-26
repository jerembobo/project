import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { BarChart3, Plus, TrendingUp, TrendingDown, AlertCircle, DollarSign } from 'lucide-react';

const GestionCharges: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = [
    { id: 'all', name: 'Toutes les charges', count: 12 },
    { id: 'marketing', name: 'Marketing', count: 4 },
    { id: 'operational', name: 'Opérationnel', count: 3 },
    { id: 'personnel', name: 'Personnel', count: 2 },
    { id: 'technology', name: 'Technologie', count: 2 },
    { id: 'administrative', name: 'Administratif', count: 1 }
  ];

  const charges = [
    {
      id: 1,
      name: 'Campagnes Facebook Ads',
      category: 'marketing',
      type: 'variable',
      amount: 3200,
      frequency: 'monthly',
      impact: 'high',
      rentabilityImpact: 85,
      trend: 'up',
      trendPercent: 15,
      recommendation: 'Optimiser le ciblage pour réduire le CPA'
    },
    {
      id: 2,
      name: 'Salaires équipe marketing',
      category: 'personnel',
      type: 'fixed',
      amount: 8500,
      frequency: 'monthly',
      impact: 'medium',
      rentabilityImpact: 65,
      trend: 'stable',
      trendPercent: 0,
      recommendation: 'Performance stable, maintenir l\'équipe actuelle'
    },
    {
      id: 3,
      name: 'Hébergement et serveurs',
      category: 'technology',
      type: 'fixed',
      amount: 450,
      frequency: 'monthly',
      impact: 'low',
      rentabilityImpact: 95,
      trend: 'up',
      trendPercent: 8,
      recommendation: 'Migrer vers une solution cloud plus économique'
    },
    {
      id: 4,
      name: 'Outils de design (Adobe)',
      category: 'operational',
      type: 'fixed',
      amount: 199,
      frequency: 'monthly',
      impact: 'low',
      rentabilityImpact: 75,
      trend: 'stable',
      trendPercent: 0,
      recommendation: 'Évaluer des alternatives moins coûteuses'
    },
    {
      id: 5,
      name: 'Frais bancaires',
      category: 'administrative',
      type: 'variable',
      amount: 125,
      frequency: 'monthly',
      impact: 'low',
      rentabilityImpact: 20,
      trend: 'down',
      trendPercent: -5,
      recommendation: 'Négocier avec la banque pour réduire les frais'
    }
  ];

  const filteredCharges = selectedCategory === 'all' 
    ? charges 
    : charges.filter(charge => charge.category === selectedCategory);

  const getTotalCharges = () => {
    return charges.reduce((sum, charge) => sum + charge.amount, 0);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend: string, percent: number) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
  };

  const getRentabilityColor = (impact: number) => {
    if (impact >= 80) return 'text-green-600 dark:text-green-400';
    if (impact >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <MainLayout 
      title="Gestion des Charges" 
      subtitle="Gestion détaillée des charges avec analyse d'impact sur la rentabilité"
    >
      <div className="space-y-8">
        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                €{getTotalCharges().toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Charges Totales</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Mensuel</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                73%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rentabilité Moyenne</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Bonne performance</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                €9,150
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Charges Fixes</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">75% du total</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                €3,325
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Charges Variables</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">+8% ce mois</p>
            </div>
          </Card>
        </div>

        {/* Filtres et actions */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Analyse des Charges par Catégorie
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Charge</span>
            </Button>
          </div>
        </Card>

        {/* Liste détaillée des charges */}
        <div className="space-y-4">
          {filteredCharges.map((charge) => (
            <Card key={charge.id} hover>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {charge.name}
                      </h4>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="capitalize text-gray-600 dark:text-gray-400">
                          {charge.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          charge.type === 'fixed' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {charge.type === 'fixed' ? 'Fixe' : 'Variable'}
                        </span>
                        <span className={`text-xs font-medium ${getImpactColor(charge.impact)}`}>
                          Impact: {charge.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recommandation IA */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Recommandation IA:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {charge.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Métriques */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">Rentabilité:</span>
                      <span className={`font-semibold ${getRentabilityColor(charge.rentabilityImpact)}`}>
                        {charge.rentabilityImpact}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">Fréquence:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {charge.frequency === 'monthly' ? 'Mensuel' : charge.frequency}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="lg:ml-8 flex flex-col lg:items-end space-y-3">
                  <div className="text-center lg:text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      €{charge.amount.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      /{charge.frequency === 'monthly' ? 'mois' : charge.frequency}
                    </p>
                  </div>
                  
                  {/* Tendance */}
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(charge.trend, charge.trendPercent)}
                    <span className={`text-sm font-medium ${
                      charge.trend === 'up' ? 'text-red-600 dark:text-red-400' :
                      charge.trend === 'down' ? 'text-green-600 dark:text-green-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {charge.trendPercent !== 0 && (charge.trendPercent > 0 ? '+' : '')}{charge.trendPercent}%
                    </span>
                  </div>
                  
                  {/* Barre de rentabilité */}
                  <div className="w-full lg:w-32">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Rentabilité</span>
                      <span>{charge.rentabilityImpact}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          charge.rentabilityImpact >= 80 ? 'bg-green-500' :
                          charge.rentabilityImpact >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(charge.rentabilityImpact, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recommandations globales */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Optimisations Recommandées
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">
                💡 Optimisation Immédiate
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Réduire les frais d'hébergement en migrant vers AWS pourrait économiser €150/mois
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Impact: +3% sur la rentabilité globale
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                📊 Analyse à Long Terme
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Renégocier les contrats marketing pourrait réduire les coûts variables de 12%
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Économie estimée: €400/mois
              </p>
            </div>
          </div>
        </Card>

        {/* Modal d'ajout (simplifié pour l'exemple) */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ajouter une Nouvelle Charge
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Fonctionnalité en cours de développement
              </p>
              <Button 
                onClick={() => setShowAddModal(false)}
                className="w-full"
              >
                Fermer
              </Button>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default GestionCharges;