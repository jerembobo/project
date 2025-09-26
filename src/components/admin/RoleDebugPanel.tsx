import React from 'react';
import { useAppMode } from '../../hooks/useAppMode';
import { useViewAs } from '../../hooks/useViewAs';
import { useAuth } from '../../hooks/useAuth';

export const RoleDebugPanel: React.FC = () => {
  const { 
    mode, 
    role, 
    realRole,
    effectiveRole,
    isPlatformAdmin, 
    isRealPlatformAdmin,
    isAgencyAdmin,
    isDemo,
    allowedPages,
    loading,
    error
  } = useAppMode();
  
  const { isFeatureEnabled, isViewAsActive, currentUiRole } = useViewAs();
  const { profile } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 text-xs">
      <h3 className="font-bold text-sm mb-2 text-red-600">🐛 Debug Panel - Rôles & Permissions</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Mode:</strong> {String(mode)} {loading && '(Loading...)'}
          {error && <span className="text-red-500"> - Erreur: {error}</span>}
        </div>
        
        <div>
          <strong>Rôle serveur:</strong> {role}
        </div>
        
        <div>
          <strong>Rôle réel:</strong> {realRole}
        </div>
        
        <div>
          <strong>Rôle effectif:</strong> {effectiveRole}
        </div>
        
        <div>
          <strong>Email utilisateur:</strong> {profile?.email || 'Non connecté'}
        </div>
        
        <hr className="my-2" />
        
        <div>
          <strong>isPlatformAdmin:</strong> {isPlatformAdmin ? '✅' : '❌'}
        </div>
        
        <div>
          <strong>isRealPlatformAdmin:</strong> {isRealPlatformAdmin ? '✅' : '❌'}
        </div>
        
        <div>
          <strong>isAgencyAdmin:</strong> {isAgencyAdmin ? '✅' : '❌'}
        </div>
        
        <div>
          <strong>isDemo:</strong> {isDemo ? '✅' : '❌'}
        </div>
        
        <hr className="my-2" />
        
        <div>
          <strong>Feature View As activé:</strong> {isFeatureEnabled ? '✅' : '❌'}
        </div>
        
        <div>
          <strong>View As actif:</strong> {isViewAsActive ? '✅' : '❌'}
        </div>
        
        {isViewAsActive && (
          <div>
            <strong>UI Role actuel:</strong> {currentUiRole}
          </div>
        )}
        
        <hr className="my-2" />
        
        <div>
          <strong>Pages autorisées:</strong> {JSON.stringify(allowedPages)}
        </div>
        
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <strong>Toggle View As visible si:</strong>
          <ul className="list-disc list-inside mt-1">
            <li>isRealPlatformAdmin = true</li>
            <li>isFeatureEnabled = true</li>
          </ul>
        </div>
      </div>
    </div>
  );
};