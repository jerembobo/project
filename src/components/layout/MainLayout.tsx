import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppMode } from '../../hooks/useAppMode';
import { useTenantContext } from '../../hooks/useTenantContext';
import { useAppStore } from '../../stores/appStore';
import { useViewAs } from '../../hooks/useViewAs';
import ModeBadge from '../ui/ModeBadge';
import { ContextSwitcher } from './ContextSwitcher';
import { AdminImpersonateToggle } from '../admin/AdminImpersonateToggle';
import {
  Menu,
  X,
  Home,
  TrendingUp,
  Target,
  DollarSign,
  PieChart,
  BarChart3,
  Settings,
  User,
  Bell,
  Moon,
  Sun,
  Users,
  Shield,
  Database,
  Crown
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title, subtitle }) => {
  const { profile, signOut } = useAuth();
  const { 
    tenantOptions, 
    currentTenantId, 
    switchTenant, 
    context 
  } = useTenantContext();
  const { currentUiRole, isViewAsActive } = useViewAs();
  const { 
    canWrite, 
    canExport, 
    isDemo, 
    isAgencyAdmin, 
    isClientViewer, 
    isPlatformAdmin,
    hasPageAccess,
    role 
  } = useAppMode(currentTenantId || undefined, isViewAsActive ? currentUiRole : undefined);
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    isDark, 
    toggleDarkMode,
    notifications 
  } = useAppStore();
  const location = useLocation();

  // Navigation de base
  let navigation = [
    { title: 'Dashboard', href: '/', icon: Home },
  ];

  // Navigation conditionnelle selon le rôle et les accès
  if (hasPageAccess('campaigns') || hasPageAccess('*')) {
    navigation.push(
      { title: 'Préconisations Facebook IA', href: '/preconisations-facebook', icon: Target },
      { title: 'Recommandations IA Pub', href: '/suggestions', icon: TrendingUp }
    );
  }

  if (hasPageAccess('products') || hasPageAccess('*')) {
    navigation.push({ title: 'Calculateur Prix Optimal', href: '/audit-prix', icon: DollarSign });
  }

  if (hasPageAccess('analytics') || hasPageAccess('*')) {
    navigation.push(
      { title: 'Gestion Coûts Business', href: '/couts-business', icon: PieChart },
      { title: 'Gestion des Charges', href: '/gestion-charges', icon: BarChart3 },
      { title: 'ROI Intelligence', href: '/roi-intelligence', icon: TrendingUp }
    );
  }

  // Pages de configuration (toujours accessibles sauf pour client_viewer)
  if (role !== 'client_viewer') {
    navigation.push({ title: 'Connexion Plateformes', href: '/connexion-plateformes', icon: Settings });
  }

  // Pages spéciales pour les agences
  if (isAgencyAdmin && (hasPageAccess('clients') || hasPageAccess('*'))) {
    navigation.push(
      { title: 'Dashboard Agence', href: '/agency', icon: Crown },
      { title: 'Gestion Clients', href: '/clients', icon: Users }
    );
  }

  // Pages admin plateforme
  if (isPlatformAdmin) {
    navigation.push(
      { title: 'Admin Agences', href: '/admin/agencies', icon: Settings },
      { title: 'Admin Système', href: '/admin/system', icon: Settings }
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-800 w-72 transform transition-transform duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-700
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">KAPEHI</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {profile?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Se déconnecter"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    {subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
                    )}
                  </div>
                  
                  {/* Context Switcher pour les agences */}
                  {(isAgencyAdmin || isPlatformAdmin) && tenantOptions.length > 0 && (
                    <div className="hidden sm:block">
                      <ContextSwitcher 
                        options={tenantOptions}
                        value={currentTenantId || undefined}
                        onChange={switchTenant}
                      />
                    </div>
                  )}
                  
                  {/* Admin View As Toggle - Visible uniquement pour les admins plateforme */}
                  {isPlatformAdmin && (
                    <div className="hidden sm:block">
                      <AdminImpersonateToggle />
                    </div>
                  )}
                </div>
                
                {/* Badge de mode */}
                <div className="hidden sm:block">
                  <ModeBadge />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Badge de mode mobile */}
                <div className="sm:hidden">
                  <ModeBadge />
                </div>
                
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                
                <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-6 py-6">
          {/* Bannière d'avertissement pour le mode démo */}
          {isDemo && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              {role === 'prospect' && (
                <div className="flex items-start space-x-3 mb-4">
                  <div className="text-orange-600 dark:text-orange-400">
                    🎯
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-orange-800 dark:text-orange-400 mb-1">
                      Accès Prospect - Fonctionnalités Limitées
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                      Vous découvrez KAPEHI avec des données de démonstration. 
                      Passez Pro ou Agence pour accéder à vos vraies données et toutes les fonctionnalités.
                    </p>
                    <button className="text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors">
                      Découvrir nos offres
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-3">
                <div className="text-yellow-600 dark:text-yellow-400">
                  🧪
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                    {role === 'prospect' ? 'Données de Démonstration' : 'Mode Démonstration'}
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {role === 'prospect' 
                      ? 'Les données affichées sont simulées pour vous permettre de découvrir KAPEHI.'
                      : 'Vous consultez des données simulées à des fins de démonstration.'
                    }
                    {!canWrite && ' Les modifications sont désactivées.'} 
                    {!canExport && ' Les exports ne sont pas disponibles.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Bannière spéciale pour client viewer */}
          {isClientViewer && (
            <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-teal-600 dark:text-teal-400">
                  👁️
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-teal-800 dark:text-teal-400 mb-1">
                    Vue Client - Accès Contrôlé
                  </h3>
                  <p className="text-sm text-teal-700 dark:text-teal-300">
                    Vous consultez les données autorisées par votre agence partenaire. 
                    Contactez votre agence pour modifier vos accès.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;