import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAppMode } from '../hooks/useAppMode';
import { useViewAs } from '../hooks/useViewAs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle, 
  Crown,
  Eye,
  Settings,
  Plus,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

const AgencyDashboard: React.FC = () => {
  const { currentUiRole, isViewAsActive } = useViewAs();
  const { isAgencyAdmin, isDemo, features } = useAppMode(undefined, isViewAsActive ? currentUiRole : undefined);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Données de démo pour les agences
  const demoStats = {
    totalClients: 12,
    activeClients: 10,
    totalRevenue: 45600,
    monthlyGrowth: 18.5,
    avgClientValue: 3800,
    shopifyConnected: 8,
    campaignsActive: 24,
    totalProducts: 1250
  };

  const demoClients = [
    {
      id: '1',
      name: 'Boutique Mode Paris',
      status: 'active',
      revenue: 12500,
      growth: 22.5,
      shopifyConnected: true,
      lastSync: '2024-01-15T10:30:00Z',
      campaigns: 6,
      products: 245
    },
    {
      id: '2',
      name: 'TechStore Pro',
      status: 'active',
      revenue: 8900,
      growth: 15.2,
      shopifyConnected: true,
      lastSync: '2024-01-15T09:45:00Z',
      campaigns: 4,
      products: 180
    },
    {
      id: '3',
      name: 'Bio Shop Nature',
      status: 'setup',
      revenue: 0,
      growth: 0,
      shopifyConnected: false,
      lastSync: null,
      campaigns: 0,
      products: 0
    },
    {
      id: '4',
      name: 'Sport Elite',
      status: 'active',
      revenue: 15200,
      growth: 28.1,
      shopifyConnected: true,
      lastSync: '2024-01-15T11:15:00Z',
      campaigns: 8,
      products: 320
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </span>
        );
      case 'setup':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Settings className="w-3 h-3 mr-1" />
            Configuration
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Inactif
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (!isAgencyAdmin) {
    return (
      <MainLayout title="Accès Refusé" subtitle="Cette page est réservée aux administrateurs d'agence">
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Accès non autorisé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Vous devez être administrateur d'agence pour accéder à cette page.
            </p>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Dashboard Agence" 
      subtitle="Vue d'ensemble de vos clients et performances"
    >
      {/* Bannière démo pour les agences */}
      {isDemo && (
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-start space-x-4">
            <Crown className="w-8 h-8 text-purple-600 dark:text-purple-400 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                🎯 Interface Agence - Mode Démo
              </h3>
              <p className="text-purple-700 dark:text-purple-300 mb-3">
                Découvrez comment gérer vos clients, suivre leurs performances et optimiser leur ROI depuis une interface centralisée.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Gestion multi-clients</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span>Switcher de contexte</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>Analytics consolidées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>ROI par client</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clients Actifs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {demoStats.activeClients}/{demoStats.totalClients}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +2 ce mois
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CA Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(demoStats.totalRevenue)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +{demoStats.monthlyGrowth}% ce mois
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valeur Moy./Client</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(demoStats.avgClientValue)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Stable
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shopify Connectés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {demoStats.shopifyConnected}/{demoStats.totalClients}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                {Math.round((demoStats.shopifyConnected / demoStats.totalClients) * 100)}% connectés
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </Button>
        <Button variant="secondary" className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4" />
          <span>Rapport Consolidé</span>
        </Button>
        <Button variant="secondary" className="flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Paramètres Agence</span>
        </Button>
      </div>

      {/* Liste des clients */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mes Clients ({demoClients.length})
          </h3>
          <div className="flex items-center space-x-2">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">CA</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Croissance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dernière Sync</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Campagnes</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demoClients.map((client) => (
                <tr key={client.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {client.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {client.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.products} produits
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(client.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(client.revenue)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {client.growth > 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +{client.growth}%
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        -
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(client.lastSync)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {client.campaigns}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
};

export default AgencyDashboard;