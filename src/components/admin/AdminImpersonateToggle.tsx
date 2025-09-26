import React, { useState } from 'react';
import { Eye, X, Settings } from 'lucide-react';
import { useAppMode, ViewAsRole } from '../../hooks/useAppMode';
import { useTenantContext, TenantOption } from '../../hooks/useTenantContext';
import { useViewAs } from '../../hooks/useViewAs';
import { ViewAsBanner } from './ViewAsBanner';

export const AdminImpersonateToggle: React.FC = () => {
  const { isRealPlatformAdmin } = useAppMode();
  const { tenantOptions } = useTenantContext();
  const { isViewAsActive, currentUiRole, uiTenantId, startViewAs, stopViewAs, isFeatureEnabled } = useViewAs();
  const [showToggle, setShowToggle] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ViewAsRole>('pro');
  const [selectedTenant, setSelectedTenant] = useState<TenantOption | undefined>();

  // Trouver le tenant actuel basé sur l'ID
  const currentTenant = tenantOptions.find(t => t.id === uiTenantId);

  // Seuls les platform_admin peuvent voir ce composant ET feature flag activé
  if (!isRealPlatformAdmin || !isFeatureEnabled) {
    return null;
  }

  const roleOptions: { value: ViewAsRole; label: string }[] = [
    { value: 'pro', label: 'Pro' },
    { value: 'agency_admin', label: 'Admin Agence' },
    { value: 'client_viewer', label: 'Viewer Client' },
    { value: 'platform_admin', label: 'Admin Plateforme' }
  ];

  const handleStartViewAs = () => {
    startViewAs(selectedRole, selectedTenant?.id);
    setShowToggle(false);
  };

  const handleStopViewAs = () => {
    stopViewAs();
  };

  return (
    <>
      {/* Bannière sticky quand View As est actif */}
      {isViewAsActive && currentUiRole && (
        <ViewAsBanner
          uiRole={currentUiRole}
          tenantName={currentTenant?.label}
          onExit={handleStopViewAs}
        />
      )}

      {/* Toggle View As */}
      <div className="relative">
        <button
          onClick={() => setShowToggle(!showToggle)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
            isViewAsActive 
              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Eye className="h-4 w-4" />
          View as
          {isViewAsActive && (
            <span className="ml-1 px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs">
              Actif
            </span>
          )}
        </button>

        {showToggle && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">View as (UI uniquement)</h3>
              <button
                onClick={() => setShowToggle(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isViewAsActive ? (
              <div className="space-y-4">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-800">
                    Mode View As actif : <strong>{roleOptions.find(r => r.value === currentUiRole)?.label}</strong>
                    {currentTenant && (
                      <span className="block mt-1">Tenant: {currentTenant.label}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleStopViewAs}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Arrêter View As
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle cible
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as ViewAsRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant (optionnel)
                  </label>
                  <select
                    value={selectedTenant?.id || ''}
                    onChange={(e) => {
                      const tenant = tenantOptions.find((t: TenantOption) => t.id === e.target.value);
                      setSelectedTenant(tenant);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un tenant</option>
                    {tenantOptions.map((tenant: TenantOption) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700">
                    ⚠️ Mode UI uniquement - Aucun impact serveur. Les permissions réelles restent inchangées.
                  </p>
                </div>

                <button
                  onClick={handleStartViewAs}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Démarrer View As
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};