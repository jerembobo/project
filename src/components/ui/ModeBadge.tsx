import React from 'react';
import { useAppMode } from '../../hooks/useAppMode';
import { useViewAs } from '../../hooks/useViewAs';
import { AlertTriangle, CheckCircle, Settings, Zap } from 'lucide-react';
import { clsx } from 'clsx';

interface ModeBadgeProps {
  className?: string;
  showDetails?: boolean;
}

const ModeBadge: React.FC<ModeBadgeProps> = ({ className, showDetails = false }) => {
  const { currentUiRole, isViewAsActive } = useViewAs();
  const { 
    mode, 
    badges, 
    warnings, 
    isDemo, 
    isOnboarding, 
    isProduction, 
    loading,
    role,
    isAgencyAdmin,
    isClientViewer,
    isPlatformAdmin
  } = useAppMode(undefined, isViewAsActive ? currentUiRole : undefined);

  if (loading || !mode) {
    return (
      <div className={clsx(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
        className
      )}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2"></div>
        Chargement...
      </div>
    );
  }

  const getModeIcon = () => {
    if (isDemo) return <Zap className="w-3 h-3" />;
    if (isOnboarding) return <Settings className="w-3 h-3" />;
    if (isProduction) return <CheckCircle className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };

  const getModeColors = () => {
    if (isDemo) {
      // Couleur différente selon le rôle en démo
      if (role === 'prospect') {
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      }
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    }
    if (isOnboarding) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    if (isProduction) {
      // Couleur différente selon le rôle en production
      if (isPlatformAdmin) {
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      }
      if (isAgencyAdmin) {
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800';
      }
      if (isClientViewer) {
        return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800';
      }
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600';
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {/* Badge principal */}
      <div className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        getModeColors()
      )}>
        {getModeIcon()}
        <span className="ml-2">{badges[0] || mode.mode}</span>
        {/* Indicateur de rôle pour les admins */}
        {isPlatformAdmin && (
          <span className="ml-2 px-1.5 py-0.5 bg-purple-200 dark:bg-purple-800 rounded text-xs">
            ADMIN
          </span>
        )}
        {isAgencyAdmin && (
          <span className="ml-2 px-1.5 py-0.5 bg-indigo-200 dark:bg-indigo-800 rounded text-xs">
            AGENCE
          </span>
        )}
        {isClientViewer && (
          <span className="ml-2 px-1.5 py-0.5 bg-teal-200 dark:bg-teal-800 rounded text-xs">
            CLIENT
          </span>
        )}
      </div>

      {/* Détails supplémentaires */}
      {showDetails && badges.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {badges.slice(1).map((badge, index) => (
            <span
              key={index}
              className={clsx(
                'inline-flex items-center px-2 py-1 rounded text-xs',
                getModeColors().replace('border-', 'border-').replace('bg-', 'bg-opacity-50 bg-')
              )}
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Avertissements */}
      {showDetails && warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className="flex items-start space-x-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-orange-700 dark:text-orange-300">{warning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModeBadge;