import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAppMode } from '../hooks/useAppMode';
import { useViewAs } from '../hooks/useViewAs';
import { useClients } from '../hooks/useClients';
import { Users, Plus, Settings, Eye, Trash2, Mail, CheckCircle, AlertCircle, Crown } from 'lucide-react';

const GestionClients: React.FC = () => {
  const { currentUiRole, isViewAsActive } = useViewAs();
  const { isAgencyAdmin, features, canWrite, mode } = useAppMode(undefined, isViewAsActive ? currentUiRole : undefined);
  const isDemo = mode?.mode === 'DEMO';
  const { clients, createClient, inviteUser, deleteClient, isLoading } = useClients();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    domain: '',
    contact_email: ''
  });
  const [inviteData, setInviteData] = useState({
    email: '',
    allowed_pages: [] as string[]
  });

  const maxClients = features?.clients_max || 0;
  const canCreateMore = clients.length < maxClients;

  const availablePages = [
    { id: 'dashboard', name: 'Dashboard', description: 'Vue d\'ensemble des performances' },
    { id: 'campaigns', name: 'Campagnes Facebook', description: 'Gestion des campagnes publicitaires' },
    { id: 'products', name: 'Produits', description: 'Catalogue et pricing' },
    { id: 'analytics', name: 'Analytics', description: 'Rapports et analyses' },
    { id: 'recommendations', name: 'Recommandations IA', description: 'Suggestions d\'optimisation' }
  ];

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.contact_email) return;
    if (!canWrite) {
      alert('Action non autorisée en mode démo');
      return;
    }
    
    await createClient(newClient);
    setNewClient({ name: '', domain: '', contact_email: '' });
    setShowCreateModal(false);
  };

  const handleInviteUser = async () => {
    if (!selectedClient || !inviteData.email || inviteData.allowed_pages.length === 0) return;
    if (!canWrite) {
      alert('Action non autorisée en mode démo');
      return;
    }
    
    await inviteUser(selectedClient.id, inviteData);
    setInviteData({ email: '', allowed_pages: [] });
    setShowInviteModal(false);
    setSelectedClient(null);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!canWrite) {
      alert('Action non autorisée en mode démo');
      return;
    }
    await deleteClient(clientId);
  };
  const togglePage = (pageId: string) => {
    setInviteData(prev => ({
      ...prev,
      allowed_pages: prev.allowed_pages.includes(pageId)
        ? prev.allowed_pages.filter(p => p !== pageId)
        : [...prev.allowed_pages, pageId]
    }));
  };

  if (!isAgencyAdmin) {
    return (
      <MainLayout title="Accès Refusé" subtitle="Cette page est réservée aux administrateurs d'agence">
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Accès non autorisé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Vous devez être administrateur d'agence pour accéder à cette page.
            </p>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Gestion Clients" 
      subtitle={`Gérez vos clients et leurs accès (${clients.length}/${maxClients})`}
    >
      <div className="space-y-8">
        {/* Mode démo - Aperçu des fonctionnalités */}
        {isDemo && (
          <Card>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  👥
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-400 mb-2">
                    Gestion Clients - Mode Démonstration
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                    Découvrez comment gérer vos clients, leurs accès et leurs données en toute simplicité. 
                    Cette interface vous permet de contrôler finement les permissions de chaque client.
                  </p>
                  
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-purple-100 dark:border-purple-700">
                    <h4 className="font-medium text-purple-800 dark:text-purple-400 mb-2 text-sm">
                      🎯 Fonctionnalités disponibles :
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-purple-700 dark:text-purple-300">Création de clients illimitée</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-purple-700 dark:text-purple-300">Gestion des permissions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-purple-700 dark:text-purple-300">Invitations utilisateurs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-purple-700 dark:text-purple-300">Suivi des connexions Shopify</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-700">
                    <p className="text-xs text-yellow-800 dark:text-yellow-300">
                      💡 <strong>Passez Agence Pro</strong> pour gérer jusqu'à 50 clients avec des fonctionnalités avancées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Header avec stats enrichies */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {clients.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clients Actifs</p>
              {isDemo && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  +2 ce mois
                </div>
              )}
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {clients.filter(c => c.shopify_connected).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Shopify Connectés</p>
              {isDemo && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  {Math.round((clients.filter(c => c.shopify_connected).length / clients.length) * 100)}% du total
                </div>
              )}
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {clients.reduce((sum, c) => sum + (c.users?.length || 0), 0)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs Invités</p>
              {isDemo && (
                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                  Moyenne: {Math.round(clients.reduce((sum, c) => sum + (c.users?.length || 0), 0) / clients.length)} par client
                </div>
              )}
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {maxClients - clients.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Places Restantes</p>
              {isDemo && (
                <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                  Plan: {maxClients} clients max
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Statistiques avancées en mode démo */}
        {isDemo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                  Performance Clients
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">CA moyen/client:</span>
                    <span className="font-medium text-gray-900 dark:text-white">8,450€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ROI moyen:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">+24%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Satisfaction:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">4.8/5</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-blue-500" />
                  Utilisation Fonctionnalités
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Audit Prix:</span>
                    <span className="font-medium text-gray-900 dark:text-white">89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ROI Intelligence:</span>
                    <span className="font-medium text-gray-900 dark:text-white">76%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Recommandations:</span>
                    <span className="font-medium text-gray-900 dark:text-white">92%</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-green-500" />
                  Activité Récente
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Connexions/jour:</span>
                    <span className="font-medium text-gray-900 dark:text-white">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rapports générés:</span>
                    <span className="font-medium text-gray-900 dark:text-white">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Support tickets:</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">2</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Actions */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Mes Clients
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Plan actuel: {maxClients} clients maximum
                {isDemo && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    • Gestion avancée disponible
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {isDemo && (
                <Button 
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir Rapports</span>
                </Button>
              )}
              
              <Button 
                onClick={() => setShowCreateModal(true)}
                disabled={!canCreateMore || isLoading || !canWrite}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{!canWrite ? 'Nouveau Client (Démo)' : 'Nouveau Client'}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Liste des clients enrichie */}
        <div className="space-y-4">
          {clients.map((client) => (
            <Card key={client.id} hover>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {client.name}
                    </h4>
                    {client.shopify_connected && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Shopify Connecté
                      </span>
                    )}
                    {isDemo && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                        Actif
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Contact: {client.contact_email}</p>
                    {client.domain && <p>Domaine: {client.domain}</p>}
                    <p>Créé le: {new Date(client.created_at).toLocaleDateString()}</p>
                    <p>Utilisateurs invités: {client.users?.length || 0}</p>
                    
                    {/* Informations supplémentaires en mode démo */}
                    {isDemo && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Dernière connexion:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">
                              {Math.random() > 0.5 ? 'Aujourd\'hui' : 'Hier'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">CA ce mois:</span>
                            <span className="ml-1 text-green-600 dark:text-green-400 font-medium">
                              {(Math.random() * 15000 + 5000).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 lg:ml-6">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => {
                      setSelectedClient(client);
                      setShowInviteModal(true);
                    }}
                    disabled={!canWrite}
                    className="flex items-center space-x-2"
                  >

                    <Mail className="w-4 h-4" />
                    <span>{!canWrite ? 'Inviter (Démo)' : 'Inviter Utilisateur'}</span>
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Voir Dashboard</span>
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="sm"
                      disabled={!canWrite}
                      className="flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Config</span>
                    </Button>
                    
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
                      disabled={!canWrite}
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {clients.length === 0 && (
            <Card>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun client pour le moment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Créez votre premier client pour commencer à gérer leurs accès.
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  disabled={!canCreateMore || !canWrite}
                >
                  {!canWrite ? 'Créer client (Démo)' : 'Créer mon premier client'}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Modal Création Client */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Nouveau Client
              </h3>
              
              {!canWrite && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    🧪 Mode démo - Cette action ne sera pas sauvegardée
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Ex: Boutique Mode Paris"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email de contact *
                  </label>
                  <input
                    type="email"
                    value={newClient.contact_email}
                    onChange={(e) => setNewClient({...newClient, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="contact@boutique.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Domaine (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newClient.domain}
                    onChange={(e) => setNewClient({...newClient, domain: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="boutique.com"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  onClick={handleCreateClient}
                  disabled={!newClient.name || !newClient.contact_email || isLoading}
                  className="flex-1"
                >
                  {!canWrite ? 'Simuler Création' : 'Créer le Client'}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal Invitation Utilisateur */}
        {showInviteModal && selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Inviter un utilisateur - {selectedClient.name}
              </h3>
              
              {!canWrite && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    🧪 Mode démo - Cette invitation ne sera pas envoyée
                  </p>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email de l'utilisateur *
                  </label>
                  <input
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="utilisateur@client.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Pages autorisées *
                  </label>
                  <div className="space-y-2">
                    {availablePages.map((page) => (
                      <div key={page.id} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={page.id}
                          checked={inviteData.allowed_pages.includes(page.id)}
                          onChange={() => togglePage(page.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label htmlFor={page.id} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                            {page.name}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {page.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  onClick={handleInviteUser}
                  disabled={!inviteData.email || inviteData.allowed_pages.length === 0 || isLoading}
                  className="flex-1"
                >
                  {!canWrite ? 'Simuler Invitation' : 'Envoyer l\'Invitation'}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowInviteModal(false);
                    setSelectedClient(null);
                    setInviteData({ email: '', allowed_pages: [] });
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Upgrade Notice */}
        {!canCreateMore && (
          <Card>
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Limite de clients atteinte
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vous avez atteint la limite de {maxClients} clients de votre plan actuel.
              </p>
              <Button variant="primary">
                Upgrader mon Plan
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default GestionClients;