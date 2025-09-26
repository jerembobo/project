import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ModeBadge from '../components/ui/ModeBadge';
import ViewAsTestPanel from '../components/admin/ViewAsTestPanel';
import { useAuth } from '../hooks/useAuth';
import { useAppMode } from '../hooks/useAppMode';
import { useViewAs } from '../hooks/useViewAs';
import { useCampaigns } from '../hooks/useCampaigns';
import { useRecommendations } from '../hooks/useRecommendations';
import { TrendingUp, Target, DollarSign, PieChart, BarChart3, Users, Settings, Crown, Eye, Shield, Database } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { currentUiRole, isViewAsActive } = useViewAs();
  const { 
    mode, 
    isDemo, 
    isOnboarding, 
    isProduction,
    source, 
    badges,
    role,
    isProspect,
    isPro,
    isAgencyAdmin,
    isClientViewer,
    isPlatformAdmin,
    hasPageAccess
  } = useAppMode(undefined, isViewAsActive ? currentUiRole : undefined);
  const { campaigns, metrics, isLoading: campaignsLoading } = useCampaigns();
  const { pendingRecommendations, totalEstimatedRoi, isLoading: recsLoading } = useRecommendations();

  const isLoading = campaignsLoading || recsLoading;

  const stats = [
    { 
      title: 'ROAS Moyen', 
      value: metrics?.averageRoas ? `${metrics.averageRoas.toFixed(1)}x` : '0x', 
      change: '+12%', 
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      title: 'Campagnes Actives', 
      value: campaigns.filter(c => c.status === 'active').length.toString(), 
      change: '+3', 
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      title: 'Revenus Totaux', 
      value: metrics?.totalRevenue ? `€${metrics.totalRevenue.toLocaleString()}` : '€0', 
      change: '+8%', 
      icon: DollarSign,
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      title: 'ROI Potentiel', 
      value: `€${totalEstimatedRoi.toLocaleString()}`, 
      change: `${pendingRecommendations.length} recos`, 
      icon: PieChart,
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  // Dashboard différencié par rôle
  const getDashboardContent = () => {
    if (isProspect) {
      return (
        <div className="space-y-8">
          {/* Message de démonstration */}
          <Card>
            <div className="text-center py-8">
              <Crown className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Découvrez KAPEHI en action
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Vous explorez actuellement une démonstration avec des données simulées. 
                Passez Pro ou Agence pour accéder à vos vraies données business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>Passer Pro - €49/mois</span>
                </Button>
                <Button variant="secondary" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Devenir Agence - €149/mois</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Aperçu des fonctionnalités avec données démo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommandations IA */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                Recommandations IA
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Optimiser audience Lookalike
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ROI estimé: +€2,340
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      Priorité haute
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Ajuster prix produit Gaming
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        ROI estimé: +€890
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      Moyen
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                        Retargeting abandons panier
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        ROI estimé: +€1,560
                      </p>
                    </div>
                    <span className="text-xs bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                      Priorité haute
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/suggestions'}
              >
                Voir toutes les recommandations
              </Button>
            </Card>

            {/* Campagnes Facebook */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Campagnes Facebook
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Produits Premium</p>
                    <p className="text-xs text-gray-500">ROAS: 6.2x • CPA: €8.90</p>
                  </div>
                  <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Actif
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Retargeting Q4</p>
                    <p className="text-xs text-gray-500">ROAS: 4.8x • CPA: €12.50</p>
                  </div>
                  <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Actif
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Prospection Gaming</p>
                    <p className="text-xs text-gray-500">ROAS: 3.4x • CPA: €15.20</p>
                  </div>
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                    Test
                  </span>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/preconisations-facebook'}
              >
                Voir les préconisations Facebook
              </Button>
            </Card>

            {/* Analyse des prix */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Audit des Prix
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Casque Gaming Pro</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">€79.99 → €86.39</p>
                    <p className="text-xs text-green-600">+€890 potentiel</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Clavier Mécanique RGB</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">€129.99 → €139.99</p>
                    <p className="text-xs text-green-600">+€1,240 potentiel</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Souris Gaming Pro</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">€59.99 → €64.99</p>
                    <p className="text-xs text-green-600">+€450 potentiel</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/audit-prix'}
              >
                Analyser tous les prix
              </Button>
            </Card>

            {/* ROI Intelligence */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                ROI Intelligence
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">4.8x</div>
                  <p className="text-sm text-gray-500">ROAS Moyen Actuel</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">5.2x</div>
                    <p className="text-xs text-gray-500">Prévu mois prochain</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">87%</div>
                    <p className="text-xs text-gray-500">Confiance IA</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-center text-purple-800 dark:text-purple-300">
                    +€4,790 de ROI supplémentaire prévu
                  </p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/roi-intelligence'}
              >
                Voir l'analyse complète
              </Button>
            </Card>
          </div>

          {/* Actions rapides pour prospects */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Explorez toutes les fonctionnalités
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = '/couts-business'}
              >
                <DollarSign className="w-6 h-6 mb-2 text-green-600" />
                <span className="text-xs">Coûts Business</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = '/gestion-charges'}
              >
                <BarChart3 className="w-6 h-6 mb-2 text-blue-600" />
                <span className="text-xs">Gestion Charges</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = '/configuration-shopify'}
              >
                <Settings className="w-6 h-6 mb-2 text-purple-600" />
                <span className="text-xs">Config Shopify</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = '/configuration-facebook'}
              >
                <Target className="w-6 h-6 mb-2 text-orange-600" />
                <span className="text-xs">Config Facebook</span>
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    if (isAgencyAdmin) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vue Agence */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              Gestion Agence
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <span className="text-sm text-indigo-700 dark:text-indigo-300">Clients actifs</span>
                <span className="font-semibold text-indigo-800 dark:text-indigo-400">12</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm text-green-700 dark:text-green-300">CA total mensuel</span>
                <span className="font-semibold text-green-800 dark:text-green-400">€45,680</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-sm text-purple-700 dark:text-purple-300">ROAS moyen clients</span>
                <span className="font-semibold text-purple-800 dark:text-purple-400">4.8x</span>
              </div>
              <Button 
                className="w-full flex items-center justify-center space-x-2"
                onClick={() => window.location.href = '/clients'}
              >
                <Users className="w-4 h-4" />
                <span>Gérer mes Clients</span>
              </Button>
            </div>
          </Card>

          {/* Actions Rapides Agence */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions Rapides
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = '/clients'}
              >
                <Users className="w-6 h-6 mb-2 text-blue-600" />
                <span className="text-xs">Nouveau Client</span>
              </Button>
              <Button variant="secondary" size="sm" className="flex flex-col items-center p-4 h-auto">
                <Eye className="w-6 h-6 mb-2 text-green-600" />
                <span className="text-xs">Vue Client</span>
              </Button>
              <Button variant="secondary" size="sm" className="flex flex-col items-center p-4 h-auto">
                <BarChart3 className="w-6 h-6 mb-2 text-purple-600" />
                <span className="text-xs">Rapport Global</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = '/connexion-plateformes'}
              >
                <Settings className="w-6 h-6 mb-2 text-orange-600" />
                <span className="text-xs">Paramètres</span>
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    if (isClientViewer) {
      return (
        <Card>
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-teal-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Dashboard Client
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vous consultez les données autorisées par votre agence partenaire.
            </p>
            <p className="text-sm text-teal-600 dark:text-teal-400">
              Accès limité aux pages configurées par votre agence
            </p>
          </div>
        </Card>
      );
    }

    if (isPlatformAdmin) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Agences</h4>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">24</div>
            <p className="text-sm text-gray-500">+3 ce mois</p>
          </Card>
          <Card>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Clients Total</h4>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">156</div>
            <p className="text-sm text-gray-500">+12 ce mois</p>
          </Card>
          <Card>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">CA Plateforme</h4>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">€89,450</div>
            <p className="text-sm text-gray-500">+18% vs mois dernier</p>
          </Card>
        </div>
      );
    }

    // Dashboard Pro standard
    return null;
  };

  return (
    <MainLayout 
      title={`Bonjour ${profile?.full_name || 'Utilisateur'} 👋`} 
      subtitle="Vue d'ensemble de vos performances et recommandations IA"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      <div className="space-y-8">
        {/* Informations de mode détaillées */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                État du Système
              </h3>
              <ModeBadge showDetails className="mb-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Source des données: <span className="font-medium">{source}</span>
                {mode?.traceId && (
                  <span className="ml-4">ID de trace: <code className="text-xs">{mode.traceId}</code></span>
                )}
              </div>
            </div>
            
            {isOnboarding && (
              <div className="text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  Prêt à connecter votre boutique Shopify ?
                </p>
                <Button onClick={() => window.location.href = '/configuration-shopify'}>
                  Configurer Shopify
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Test Panel pour les admins plateforme */}
        {isPlatformAdmin && (
          <ViewAsTestPanel />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} hover className="relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className={`text-sm font-medium ${stat.color} mt-1`}>
                      {stat.change} vs mois dernier
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Dashboard différencié par rôle */}
        {getDashboardContent()}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommandations Récentes */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recommandations IA Récentes
              </h3>
              <span 
                className="text-sm text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
                onClick={() => hasPageAccess('recommendations') && (window.location.href = '/suggestions')}
              >
                Voir tout
              </span>
            </div>
            
            <div className="space-y-4">
              {pendingRecommendations.slice(0, 3).map((rec) => (
                <div 
                  key={rec.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {rec.category}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      +€{rec.estimated_roi}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      rec.impact === 'high' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                        : rec.impact === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {rec.impact === 'high' ? 'Haute' : rec.impact === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>
                </div>
              ))}
              
              {pendingRecommendations.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune recommandation en attente</p>
                </div>
              )}
            </div>
          </Card>

          {/* Accès Rapide */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Accès Rapide
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                ...(hasPageAccess('campaigns') ? [{ title: 'Préconisations Facebook', icon: Target, href: '/preconisations-facebook' }] : []),
                ...(hasPageAccess('recommendations') ? [{ title: 'Suggestions IA', icon: TrendingUp, href: '/suggestions' }] : []),
                ...(hasPageAccess('products') ? [{ title: 'Audit Prix', icon: DollarSign, href: '/audit-prix' }] : []),
                ...(hasPageAccess('analytics') ? [{ title: 'Gestion Coûts', icon: PieChart, href: '/couts-business' }] : []),
                ...(isAgencyAdmin ? [{ title: 'Mes Clients', icon: Users, href: '/clients' }] : [])
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                    onClick={() => window.location.href = item.href}
                  >
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 text-center">
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Performance Globale - 30 Derniers Jours
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                €{metrics?.totalRevenue?.toLocaleString() || '0'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenus générés</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">+18% vs période précédente</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                €{metrics?.totalSpend?.toLocaleString() || '0'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Budget publicitaire</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Efficacité optimisée</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {metrics?.averageRoas ? `${metrics.averageRoas.toFixed(1)}x` : '0x'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ROAS moyen</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Performance excellente</p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;