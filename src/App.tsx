import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/ui/LoadingSpinner';
import TenantRouter from './components/routing/TenantRouter';

function App() {
  const { initialized, loading } = useAuth();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de KAPEHI...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <TenantRouter />
      </div>
    </Router>
  );
}

export default App;