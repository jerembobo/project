import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { DollarSign, TrendingUp, Calculator, Download, FolderSync as Sync, BarChart } from 'lucide-react';

const AuditPrix: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('cost-plus');
  const [productData, setProductData] = useState({
    cost: 45.00,
    currentPrice: 79.99,
    targetMargin: 35
  });

  const strategies = [
    {
      id: 'cost-plus',
      name: 'Cost-Plus Pricing',
      description: 'Prix = Coût + Marge fixe',
      compliant: 'IFRS 2',
      formula: 'Coût × (1 + Marge%)'
    },
    {
      id: 'markup',
      name: 'Markup Pricing',
      description: 'Marge basée sur le coût',
      compliant: 'IFRS 15',
      formula: 'Coût + (Coût × Markup%)'
    },
    {
      id: 'value-based',
      name: 'Value-Based',
      description: 'Prix basé sur la valeur perçue',
      compliant: 'IFRS 13',
      formula: 'Valeur Client - Coût Acquisition'
    },
    {
      id: 'competition-based',
      name: 'Competition-Based',
      description: 'Prix aligné sur la concurrence',
      compliant: 'IFRS 8',
      formula: 'Prix Concurrent ± Différentiel'
    },
    {
      id: 'psychological',
      name: 'Psychological Pricing',
      description: 'Prix psychologiquement optimisé',
      compliant: 'IFRS 15',
      formula: 'Prix Optimal - 0.01'
    }
  ];

  const calculatePrices = () => {
    const { cost, targetMargin } = productData;
    
    return {
      'cost-plus': cost * (1 + targetMargin / 100),
      'markup': cost + (cost * targetMargin / 100),
      'value-based': cost * 2.4, // Exemple basé sur l'analyse de valeur
      'competition-based': 82.99, // Prix concurrent moyen
      'psychological': 79.99 // Prix psychologique optimal
    };
  };

  const prices = calculatePrices();
  const selectedPrice = prices[selectedStrategy as keyof typeof prices];
  const profitMargin = ((selectedPrice - productData.cost) / selectedPrice) * 100;
  const roiEstimate = ((selectedPrice - productData.currentPrice) / productData.currentPrice) * 100;

  const shopifyProducts = [
    {
      id: 1,
      name: 'Casque Gaming Pro',
      sku: 'CGP-001',
      currentPrice: 79.99,
      suggestedPrice: 86.39,
      cost: 45.00,
      sales30d: 124,
      impact: '+€890'
    },
    {
      id: 2,
      name: 'Clavier Mécanique RGB',
      sku: 'CMR-002',
      currentPrice: 129.99,
      suggestedPrice: 139.99,
      cost: 78.00,
      sales30d: 89,
      impact: '+€890'
    },
    {
      id: 3,
      name: 'Souris Gaming Wireless',
      sku: 'SGW-003',
      currentPrice: 59.99,
      suggestedPrice: 64.99,
      cost: 32.00,
      sales30d: 156,
      impact: '+€780'
    }
  ];

  return (
    <MainLayout 
      title="Calculateur Prix Optimal" 
      subtitle="Optimisation pricing avec 5 stratégies comptables conformes IFRS"
    >
      <div className="space-y-8">
        {/* Header avec actions */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                Analyse et Optimisation des Prix
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Conformité IFRS • Dernière sync Shopify: Il y a 5 minutes
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="secondary" className="flex items-center space-x-2">
                <Sync className="w-4 h-4" />
                <span>Sync Shopify</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Analyse</span>
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculateur */}
          <div className="lg:col-span-2 space-y-6">
            {/* Données Produit */}
            <Card>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Données Produit
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Coût de Production (€)
                  </label>
                  <input
                    type="number"
                    value={productData.cost}
                    onChange={(e) => setProductData({...productData, cost: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix Actuel (€)
                  </label>
                  <input
                    type="number"
                    value={productData.currentPrice}
                    onChange={(e) => setProductData({...productData, currentPrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Marge Cible (%)
                  </label>
                  <input
                    type="number"
                    value={productData.targetMargin}
                    onChange={(e) => setProductData({...productData, targetMargin: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            {/* Stratégies de Pricing */}
            <Card>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Stratégies IFRS Conformes
              </h4>
              
              <div className="space-y-3">
                {strategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    onClick={() => setSelectedStrategy(strategy.id)}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all duration-200
                      ${selectedStrategy === strategy.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {strategy.name}
                          </h5>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded">
                            {strategy.compliant}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {strategy.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                          {strategy.formula}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          €{prices[strategy.id as keyof typeof prices].toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Résultats */}
          <div className="space-y-6">
            <Card>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Prix Recommandé
              </h4>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  €{selectedPrice.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stratégie: {strategies.find(s => s.id === selectedStrategy)?.name}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Marge Bénéficiaire</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ROI Estimé</span>
                  <span className={`font-semibold ${roiEstimate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {roiEstimate > 0 ? '+' : ''}{roiEstimate.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Profit/Unité</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    €{(selectedPrice - productData.cost).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <Button className="w-full mt-6">
                Appliquer ce Prix
              </Button>
            </Card>

            <Card>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart className="w-5 h-5 mr-2" />
                Impact Prévisionnel
              </h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Revenus mensuels</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">+€2,340</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Conversion estimée</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">-2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Marge globale</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">+12%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Produits Shopify */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Recommandations Prix Shopify
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Produit</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Prix Actuel</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Prix Suggéré</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Ventes 30j</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Impact</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {shopifyProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.sku}</div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        €{product.currentPrice}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="font-medium text-green-600 dark:text-green-400">
                        €{product.suggestedPrice}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-gray-700 dark:text-gray-300">
                        {product.sales30d}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {product.impact}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <Button variant="primary" size="sm">
                        Appliquer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AuditPrix;