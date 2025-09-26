import React from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { useTenantContext } from '../../hooks/useTenantContext';

// Pages
import Dashboard from '../../pages/Dashboard';
import PreconisationsFacebook from '../../pages/PreconisationsFacebook';
import Suggestions from '../../pages/Suggestions';
import AuditPrix from '../../pages/AuditPrix';
import CoutsBusiness from '../../pages/CoutsBusiness';
import GestionCharges from '../../pages/GestionCharges';
import RoiIntelligence from '../../pages/RoiIntelligence';
import ConfigurationShopify from '../../pages/ConfigurationShopify';
import ConfigurationFacebook from '../../pages/ConfigurationFacebook';
import ConnexionPlateformes from '../../pages/ConnexionPlateformes';
import GestionClients from '../../pages/GestionClients';
import AgencyDashboard from '../../pages/AgencyDashboard';

// Composant pour valider et synchroniser le tenant depuis l'URL
const TenantValidator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { currentTenantId, switchTenant, tenantOptions, isLoading } = useTenantContext();

  // Si on charge encore, afficher un loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validation du contexte...</p>
        </div>
      </div>
    );
  }

  // Si le tenant dans l'URL est différent du tenant actuel, synchroniser
  if (tenantId && tenantId !== currentTenantId) {
    // Vérifier que le tenant est valide
    const isValidTenant = tenantOptions.some(option => option.id === tenantId);
    
    if (isValidTenant) {
      switchTenant(tenantId);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Changement de contexte...</p>
          </div>
        </div>
      );
    } else {
      // Tenant invalide, rediriger vers le tenant par défaut
      const defaultTenant = tenantOptions[0]?.id;
      if (defaultTenant) {
        return <Navigate to={`/t/${defaultTenant}/dashboard`} replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
};

// Routes principales de l'application
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="preconisations-facebook" element={<PreconisationsFacebook />} />
      <Route path="suggestions" element={<Suggestions />} />
      <Route path="audit-prix" element={<AuditPrix />} />
      <Route path="couts-business" element={<CoutsBusiness />} />
      <Route path="gestion-charges" element={<GestionCharges />} />
      <Route path="roi-intelligence" element={<RoiIntelligence />} />
      <Route path="configuration-shopify" element={<ConfigurationShopify />} />
      <Route path="configuration-facebook" element={<ConfigurationFacebook />} />
      <Route path="connexion-plateformes" element={<ConnexionPlateformes />} />
      <Route path="clients" element={<GestionClients />} />
      <Route path="agency" element={<AgencyDashboard />} />
      {/* Redirection par défaut vers dashboard */}
      <Route path="" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

// Router principal avec support des tenants
export const TenantRouter: React.FC = () => {
  const { currentTenantId, tenantOptions } = useTenantContext();

  return (
    <Routes>
      {/* Routes avec tenant dans l'URL */}
      <Route path="/t/:tenantId/*" element={
        <TenantValidator>
          <AppRoutes />
        </TenantValidator>
      } />
      
      {/* Routes sans tenant - rediriger vers le tenant par défaut */}
      <Route path="/*" element={
        currentTenantId ? (
          <Navigate to={`/t/${currentTenantId}/dashboard`} replace />
        ) : tenantOptions.length > 0 ? (
          <Navigate to={`/t/${tenantOptions[0].id}/dashboard`} replace />
        ) : (
          <AppRoutes />
        )
      } />
    </Routes>
  );
};

export default TenantRouter;