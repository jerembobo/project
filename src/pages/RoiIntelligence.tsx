import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TrendingUp, Brain, Target, BarChart, LineChart, Calendar } from 'lucide-react';

const RoiIntelligence: React.FC = () => {
  const [timeframe, setTimeframe] = useState('30');
  const [analysisType, setAnalysisType] = useState('predictive');

  const roiMetrics = {
    current: {
      roas: 4.8,
      roi: 284,
      totalInvestment: 15600,
      totalRevenue: 59904,
      conversions: 1247
    },
    predicted: {
      nextMonth: {
        roas: 5.2,
        roi: 312,
        confidence: 87
      },
      next3Months: {
        roas: 5.8,
        roi: 356,
        confidence: 74
      }
    }
  };

  const campaigns = [
    {
      id: 1,
      name: 'Campagne Premium Products',
      currentRoi: 420,
      predictedRoi: 485,
      investment: 3200,
      revenue: 13440,
      trend: 'up',
      confidence: 92
    },
    {
      id: 2,
      name: 'Retargeting Q4',
      currentRoi: 380,
      predictedRoi: 415,
      investment: 1800,
      revenue: 6840,
      trend: 'up',
      confidence: 88
    },
    {
      id: 3,
      name: 'Prospection Lookalike',
      currentRoi: 195,
      predictedRoi: 245,
      investment: 4500,
      revenue: 8775,
      trend: 'stable',
      confidence: 76
    }
  ];

  const optimizationSuggestions = [
    {
      id: 1,
      type: 'budget',
      title: 'Réallocation Budget Optimal',
      description: 'Transférer 25% du budget de Prospection vers Premium Products',
      impactRoi: +65,
      confidence: 91,
      priority: 'high'
    },
    {
      id: 2,
      type: 'timing',
      title: 'Optimisation Temporelle',
      description: 'Concentrer 70% du budget sur les créneaux 18h-22h',
      impactRoi: +42,
      confidence: 85,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'audience',
      title: 'Expansion Audience Performante',
      description: 'Élargir l\'audience Lookalike 1% vers 2% pour Premium Products',
      impactRoi: +38,
      confidence: 79,
      priority: 'medium'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout 
      title="ROI Intelligence" 
      subtitle="Intelligence ROI avec analyses prédictives et optimisations automatisées"
    >
      <div className="space-y-8">
        {/* Controls */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                Analyse Prédictive ROI
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                IA avancée • Confiance moyenne: 84% • Dernière analyse: Il y a 12 min
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
              </select>
              
              <select 
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value="predictive">Analyse Prédictive</option>
                <option value="comparative">Analyse Comparative</option>
                <option value="optimization">Optimisation</option>
              </select>
            </div>
          </div>
        </Card>

        {/* ROI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {roiMetrics.current.roas}x
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ROAS Actuel</p>
              <div className="flex items-center justify-center mt-2 text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% vs période précédente
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {roiMetrics.current.roi}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ROI Global</p>
              <div className="flex items-center justify-center mt-2 text-xs text-purple-600 dark:text-purple-400">
                <Brain className="w-3 h-3 mr-1" />
                Prédiction: {roiMetrics.predicted.nextMonth.roi}%
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                €{roiMetrics.current.totalRevenue.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenus Générés</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {timeframe} derniers jours
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {roiMetrics.predicted.nextMonth.confidence}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confiance IA</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                Prédiction fiable
              </p>
            </div>
          </Card>
        </div>

        {/* Predictive Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-blue-600" />
              Prédictions ROI
            </h4>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-blue-800 dark:text-blue-400 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Prochains 30 jours
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">ROAS Prédit:</span>
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-400">
                      {roiMetrics.predicted.nextMonth.roas}x
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">ROI Prédit:</span>
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-400">
                      {roiMetrics.predicted.nextMonth.roi}%
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    Confiance: {roiMetrics.predicted.nextMonth.confidence}%
                  </span>
                  <div className="ml-2 flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full"
                      style={{ width: `${roiMetrics.predicted.nextMonth.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-purple-800 dark:text-purple-400 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Prochains 90 jours
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700 dark:text-purple-300">ROAS Prédit:</span>
                    <div className="text-lg font-bold text-purple-800 dark:text-purple-400">
                      {roiMetrics.predicted.next3Months.roas}x
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-700 dark:text-purple-300">ROI Prédit:</span>
                    <div className="text-lg font-bold text-purple-800 dark:text-purple-400">
                      {roiMetrics.predicted.next3Months.roi}%
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-xs text-purple-600 dark:text-purple-400">
                    Confiance: {roiMetrics.predicted.next3Months.confidence}%
                  </span>
                  <div className="ml-2 flex-1 bg-purple-200 dark:bg-purple-800 rounded-full h-1">
                    <div 
                      className="bg-purple-600 h-1 rounded-full"
                      style={{ width: `${roiMetrics.predicted.next3Months.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-green-600" />
              Performance par Campagne
            </h4>
            
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">{campaign.name}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Investissement: €{campaign.investment.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {campaign.currentRoi}%
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ROI Actuel</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Prédiction:</span>
                      <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
                        {campaign.predictedRoi}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-500 mr-2">
                        Confiance: {campaign.confidence}%
                      </span>
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${campaign.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Optimization Suggestions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-600" />
            Optimisations Intelligentes Recommandées
          </h3>
          
          <div className="space-y-4">
            {optimizationSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {suggestion.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority === 'high' ? 'Haute' : suggestion.priority === 'medium' ? 'Moyenne' : 'Basse'} Priorité
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Type: {suggestion.type}</span>
                      <span>Confiance IA: {suggestion.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="lg:ml-6 flex flex-col lg:items-end space-y-2">
                    <div className="text-center lg:text-right">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        +{suggestion.impactRoi}%
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Impact ROI Estimé</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="primary" size="sm">
                        Appliquer
                      </Button>
                      <Button variant="secondary" size="sm">
                        Analyser
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            Insights IA Avancés
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                🧠 Pattern Detection
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                L'IA détecte une corrélation de 89% entre les campagnes premium et les audiences lookalike 1-2%.
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Recommandation: Concentrer 75% du budget sur ces segments
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                📈 Seasonal Forecast
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Prédiction d'une hausse de 35% des conversions dans les 2 prochaines semaines.
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Optimisation: Augmenter les budgets de 25% dès maintenant
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RoiIntelligence;