import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PieChart, Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Download } from 'lucide-react';

const CoutsBusiness: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCost, setNewCost] = useState({
    name: '',
    category: 'marketing',
    type: 'fixed',
    amount: 0,
    frequency: 'monthly'
  });

  const costs = [
    {
      id: 1,
      name: 'Facebook Ads',
      category: 'marketing',
      type: 'variable',
      amount: 2450,
      frequency: 'monthly',
      trend: 'up',
      trendPercent: 12,
      lastMonth: 2180
    },
    {
      id: 2,
      name: 'Google Ads',
      category: 'marketing',
      type: 'variable',
      amount: 1890,
      frequency: 'monthly',
      trend: 'down',
      trendPercent: -8,
      lastMonth: 2050
    },
    {
      id: 3,
      name: 'Shopify Abonnement',
      category: 'technology',
      type: 'fixed',
      amount: 29,
      frequency: 'monthly',
      trend: 'stable',
      trendPercent: 0,
      lastMonth: 29
    },
    {
      id: 4,
      name: 'Salaires Marketing',
      category: 'personnel',
      type: 'fixed',
      amount: 4500,
      frequency: 'monthly',
      trend: 'stable',
      trendPercent: 0,
      lastMonth: 4500
    },
    {
      id: 5,
      name: 'Outils Analytics',
      category: 'technology',
      type: 'fixed',
      amount: 199,
      frequency: 'monthly',
      trend: 'up',
      trendPercent: 5,
      lastMonth: 189
    }
  ];

  const categories = [
    { id: 'marketing', name: 'Marketing', color: 'bg-blue-500' },
    { id: 'operational', name: 'Opérationnel', color: 'bg-green-500' },
    { id: 'personnel', name: 'Personnel', color: 'bg-purple-500' },
    { id: 'technology', name: 'Technologie', color: 'bg-orange-500' },
    { id: 'administrative', name: 'Administratif', color: 'bg-red-500' },
    { id: 'financial', name: 'Financier', color: 'bg-yellow-500' }
  ];

  const calculateTotals = () => {
    const totalFixed = costs.filter(c => c.type === 'fixed').reduce((sum, c) => sum + c.amount, 0);
    const totalVariable = costs.filter(c => c.type === 'variable').reduce((sum, c) => sum + c.amount, 0);
    const totalCosts = totalFixed + totalVariable;
    
    return { totalFixed, totalVariable, totalCosts };
  };

  const { totalFixed, totalVariable, totalCosts } = calculateTotals();

  const getCategoryTotal = (categoryId: string) => {
    return costs.filter(c => c.category === categoryId).reduce((sum, c) => sum + c.amount, 0);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const handleAddCost = () => {
    // Logique d'ajout de coût
    setShowAddModal(false);
    setNewCost({ name: '', category: 'marketing', type: 'fixed', amount: 0, frequency: 'monthly' });
  };

  return (
    <MainLayout 
      title="Gestion Coûts Business" 
      subtitle="Gestion coûts avec intégration métriques Facebook/Shopify"
    >
      <div className="space-y-8">
        {/* Header avec actions */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-green-600" />
                Tableau de Bord Coûts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Synchronisation temps réel avec Facebook Ads & Shopify
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                className="flex items-center space-x-2"
                onClick={() => {}}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Coût</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                €{totalCosts.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Coûts Totaux</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Ce mois</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                €{totalFixed.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Coûts Fixes</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Stable</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                €{totalVariable.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Coûts Variables</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">+2% vs mois dernier</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                5.2x
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ROI Global</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Performance excellente</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Répartition par Catégorie */}
          <Card className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Répartition par Catégorie
            </h4>
            
            <div className="space-y-4">
              {categories.map((category) => {
                const total = getCategoryTotal(category.id);
                const percentage = totalCosts > 0 ? (total / totalCosts) * 100 : 0;
                
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        €{total.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Liste des Coûts */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Détail des Coûts
              </h4>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">Nom</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-900 dark:text-white">Type</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-900 dark:text-white">Montant</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-900 dark:text-white">Évolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costs.map((cost) => (
                      <tr key={cost.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-2">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{cost.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{cost.category}</div>
                          </div>
                        </td>
                        <td className="text-center py-4 px-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            cost.type === 'fixed' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                          }`}>
                            {cost.type === 'fixed' ? 'Fixe' : 'Variable'}
                          </span>
                        </td>
                        <td className="text-right py-4 px-2">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            €{cost.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            /{cost.frequency === 'monthly' ? 'mois' : cost.frequency}
                          </div>
                        </td>
                        <td className="text-center py-4 px-2">
                          <div className="flex items-center justify-center space-x-1">
                            {getTrendIcon(cost.trend)}
                            <span className={`text-sm font-medium ${
                              cost.trend === 'up' ? 'text-red-600 dark:text-red-400' :
                              cost.trend === 'down' ? 'text-green-600 dark:text-green-400' :
                              'text-gray-500 dark:text-gray-400'
                            }`}>
                              {cost.trendPercent > 0 ? '+' : ''}{cost.trendPercent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recommandations IA */}
            <Card>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Recommandations d'Optimisation
              </h4>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                    Réduction Budget Facebook Ads
                  </h5>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                    Vos campagnes Facebook montrent des signes de fatigue publicitaire. Réduire de 15% le budget pourrait maintenir le ROAS.
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    Économie estimée: €367/mois
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h5 className="font-medium text-green-800 dark:text-green-400 mb-2">
                    Négociation Outils SaaS
                  </h5>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                    Vous payez plus cher que la moyenne du marché pour vos outils analytics. Possibilité de négocier une réduction.
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Économie estimée: €50/mois
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Modal d'ajout de coût */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ajouter un Nouveau Coût
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du coût
                  </label>
                  <input
                    type="text"
                    value={newCost.name}
                    onChange={(e) => setNewCost({...newCost, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={newCost.category}
                      onChange={(e) => setNewCost({...newCost, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={newCost.type}
                      onChange={(e) => setNewCost({...newCost, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="fixed">Fixe</option>
                      <option value="variable">Variable</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Montant (€)
                    </label>
                    <input
                      type="number"
                      value={newCost.amount}
                      onChange={(e) => setNewCost({...newCost, amount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fréquence
                    </label>
                    <select
                      value={newCost.frequency}
                      onChange={(e) => setNewCost({...newCost, frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="daily">Quotidien</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuel</option>
                      <option value="quarterly">Trimestriel</option>
                      <option value="yearly">Annuel</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button onClick={handleAddCost} className="flex-1">
                  Ajouter
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CoutsBusiness;