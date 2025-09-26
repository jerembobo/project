import React from 'react';
import { X, Eye, AlertTriangle } from 'lucide-react';
import { ViewAsRole } from '../../hooks/useAppMode';

interface ViewAsBannerProps {
  uiRole: ViewAsRole;
  tenantName?: string;
  onExit: () => void;
}

const roleLabels: Record<ViewAsRole, string> = {
  pro: 'Pro',
  agency_admin: 'Admin Agence',
  client_viewer: 'Viewer Client',
  platform_admin: 'Admin Plateforme'
};

export const ViewAsBanner: React.FC<ViewAsBannerProps> = ({
  uiRole,
  tenantName,
  onExit
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5" />
          <div className="flex items-center gap-2">
            <span className="font-medium">👤 View as:</span>
            <span className="font-semibold">{roleLabels[uiRole]}</span>
            {tenantName && (
              <>
                <span className="text-orange-200">(tenant:</span>
                <span className="font-medium">{tenantName}</span>
                <span className="text-orange-200">)</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-orange-100 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Mode lecture seule - Aucune écriture autorisée</span>
          </div>
          
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded-md transition-colors text-sm font-medium"
          >
            <X className="h-4 w-4" />
            Quitter
          </button>
        </div>
      </div>
    </div>
  );
};