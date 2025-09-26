import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from './Button';
import Card from './Card';
import { CheckCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';

const SupabaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [details, setDetails] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setStatus('loading');
    
    try {
      console.log('🔍 Test connexion Supabase...');
      
      // Test 1: Vérifier la configuration
      const config = {
        url: supabase.supabaseUrl,
        key: supabase.supabaseKey ? '✅ Définie' : '❌ Manquante',
        hasClient: !!supabase
      };
      
      console.log('📋 Configuration:', config);
      
      // Test 2: Test de connexion simple
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Erreur connexion:', error);
        setStatus('error');
        setDetails({
          config,
          error: error.message,
          code: error.code,
          hint: error.hint
        });
      } else {
        console.log('✅ Connexion Supabase réussie!');
        setStatus('connected');
        setDetails({
          config,
          connectionTest: '✅ Réussi',
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
    } catch (err: any) {
      console.error('💥 Erreur test:', err);
      setStatus('error');
      setDetails({
        error: err.message,
        stack: err.stack
      });
    }
    
    setTesting(false);
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Test Connexion Supabase
        </h3>
        
        <div className="flex items-center space-x-3">
          {status === 'connected' && (
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Connecté</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Erreur</span>
            </div>
          )}
          
          {status === 'loading' && (
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="font-medium">Test en cours...</span>
            </div>
          )}
          
          <Button
            onClick={testConnection}
            loading={testing}
            size="sm"
            variant="secondary"
          >
            Retester
          </Button>
        </div>
      </div>
      
      {details && (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              📋 Détails de Configuration
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">URL Supabase:</span>
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                  {details.config?.url}
                </div>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">Clé API:</span>
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                  {details.config?.key}
                </div>
              </div>
              
              {details.connectionTest && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Test Connexion:</span>
                  <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                    {details.connectionTest}
                  </div>
                </div>
              )}
              
              {details.timestamp && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Dernière vérification:</span>
                  <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                    {details.timestamp}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {details.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">
                ❌ Erreur Détectée
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                {details.error}
              </p>
              {details.code && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Code: {details.code}
                </p>
              )}
              {details.hint && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Conseil: {details.hint}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default SupabaseConnectionTest;