import React from 'react';
import { useAppMode } from '../../hooks/useAppMode';
import { useViewAs } from '../../hooks/useViewAs';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Shield, Lock, Unlock, AlertTriangle } from 'lucide-react';

const ViewAsTestPanel: React.FC = () => {
  const { currentUiRole, isViewAsActive } = useViewAs();
  const { 
    canWrite, 
    canExport, 
    canSync, 
    role, 
    realRole, 
    isUiOverrideActive,
    effectiveRole 
  } = useAppMode(undefined, isViewAsActive ? currentUiRole : undefined);

  const handleTestWrite = () => {
    if (!canWrite) {
      alert('❌ Action d\'écriture bloquée en mode View As !');
      return;
    }
    alert('✅ Action d\'écriture autorisée');
  };

  const handleTestExport = () => {
    if (!canExport) {
      alert('❌ Export bloqué en mode View As !');
      return;
    }
    alert('✅ Export autorisé');
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Test Panel - Capacités View As
          </h3>
        </div>

        {/* État actuel */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">État Actuel</h4>
            <div className="text-sm space-y-1">
              <p>Mode View As: <span className={`font-medium ${isViewAsActive ? 'text-orange-600' : 'text-green-600'}`}>
                {isViewAsActive ? 'ACTIF' : 'INACTIF'}
              </span></p>
              <p>Rôle UI: <span className="font-medium text-blue-600">{role}</span></p>
              {isViewAsActive && (
                <p>Rôle Réel: <span className="font-medium text-gray-600">{realRole}</span></p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Capacités</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-2">
                {canWrite ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-red-500" />}
                <span className={canWrite ? 'text-green-600' : 'text-red-600'}>
                  Écriture: {canWrite ? 'Autorisée' : 'Bloquée'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {canExport ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-red-500" />}
                <span className={canExport ? 'text-green-600' : 'text-red-600'}>
                  Export: {canExport ? 'Autorisé' : 'Bloqué'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {canSync ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-red-500" />}
                <span className={canSync ? 'text-green-600' : 'text-red-600'}>
                  Sync: {canSync ? 'Autorisé' : 'Bloqué'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Avertissement en mode View As */}
        {isViewAsActive && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-400">
                  Mode View As Actif
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Les actions d'écriture sont désactivées pour simuler le rôle "{currentUiRole}".
                  Seule la lecture est autorisée.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Boutons de test */}
        <div className="flex space-x-3">
          <Button
            onClick={handleTestWrite}
            disabled={!canWrite}
            variant={canWrite ? "primary" : "secondary"}
            className="flex items-center space-x-2"
          >
            {canWrite ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>Tester Écriture</span>
          </Button>

          <Button
            onClick={handleTestExport}
            disabled={!canExport}
            variant={canExport ? "primary" : "secondary"}
            className="flex items-center space-x-2"
          >
            {canExport ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>Tester Export</span>
          </Button>
        </div>

        {/* Debug info */}
        <details className="text-xs text-gray-500 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
            Debug Info
          </summary>
          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
{JSON.stringify({
  isViewAsActive,
  currentUiRole,
  role,
  realRole,
  effectiveRole,
  isUiOverrideActive,
  capabilities: { canWrite, canExport, canSync }
}, null, 2)}
          </pre>
        </details>
      </div>
    </Card>
  );
};

export default ViewAsTestPanel;