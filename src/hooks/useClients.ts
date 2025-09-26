import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';

interface Client {
  id: string;
  name: string;
  domain?: string;
  contact_email: string;
  shopify_connected: boolean;
  created_at: string;
  users?: Array<{
    id: string;
    email: string;
    allowed_pages: string[];
  }>;
}

interface CreateClientData {
  name: string;
  domain?: string;
  contact_email: string;
}

interface InviteUserData {
  email: string;
  allowed_pages: string[];
}

export const useClients = () => {
  const { user } = useAuthStore();
  const { addNotification } = useAppStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClients = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Récupérer les tenants enfants (clients de l'agence)
      const { data: clientTenants, error: tenantsError } = await supabase
        .from('tenants')
        .select(`
          id,
          name,
          domain,
          contact_email,
          shopify_connected,
          created_at,
          memberships!inner(
            user_id,
            allowed_pages,
            profiles!inner(email)
          )
        `)
        .eq('category', 'customer')
        .not('parent_tenant_id', 'is', null);

      if (tenantsError) throw tenantsError;

      const formattedClients = clientTenants?.map(tenant => ({
        id: tenant.id,
        name: tenant.name || 'Client sans nom',
        domain: tenant.domain,
        contact_email: tenant.contact_email || '',
        shopify_connected: tenant.shopify_connected,
        created_at: tenant.created_at,
        users: tenant.memberships?.map((membership: any) => ({
          id: membership.user_id,
          email: membership.profiles.email,
          allowed_pages: membership.allowed_pages || []
        })) || []
      })) || [];

      setClients(formattedClients);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de chargement',
        message: 'Impossible de charger la liste des clients'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createClient = async (clientData: CreateClientData) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Récupérer le tenant de l'agence actuelle
      const { data: agencyMembership, error: membershipError } = await supabase
        .from('memberships')
        .select('tenant_id, tenants!inner(category)')
        .eq('user_id', user.id)
        .eq('role', 'agency_admin')
        .single();

      if (membershipError || !agencyMembership) {
        throw new Error('Vous devez être administrateur d\'agence');
      }

      // Créer le tenant client
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: clientData.name,
          domain: clientData.domain,
          contact_email: clientData.contact_email,
          category: 'customer',
          parent_tenant_id: agencyMembership.tenant_id,
          created_by: user.id
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      addNotification({
        type: 'success',
        title: 'Client créé',
        message: `Le client "${clientData.name}" a été créé avec succès`
      });

      // Rafraîchir la liste
      await fetchClients();
    } catch (error: any) {
      console.error('Error creating client:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de création',
        message: error.message || 'Impossible de créer le client'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inviteUser = async (clientId: string, inviteData: InviteUserData) => {
    try {
      setIsLoading(true);

      // Créer l'utilisateur s'il n'existe pas
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: inviteData.email,
        email_confirm: true,
        user_metadata: {
          invited_by: user?.id,
          tenant_id: clientId
        }
      });

      if (authError && !authError.message.includes('already registered')) {
        throw authError;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        // Si l'utilisateur existe déjà, le récupérer
        const { data: existingUser, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', inviteData.email)
          .single();

        if (userError) throw new Error('Utilisateur introuvable');
      }

      // Créer le membership
      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          tenant_id: clientId,
          user_id: userId || existingUser.id,
          role: 'client_viewer',
          allowed_pages: inviteData.allowed_pages
        });

      if (membershipError) throw membershipError;

      addNotification({
        type: 'success',
        title: 'Invitation envoyée',
        message: `L'utilisateur ${inviteData.email} a été invité avec succès`
      });

      // Rafraîchir la liste
      await fetchClients();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      addNotification({
        type: 'error',
        title: 'Erreur d\'invitation',
        message: error.message || 'Impossible d\'envoyer l\'invitation'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      addNotification({
        type: 'success',
        title: 'Client supprimé',
        message: 'Le client a été supprimé avec succès'
      });

      // Rafraîchir la liste
      await fetchClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de suppression',
        message: error.message || 'Impossible de supprimer le client'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  return {
    clients,
    isLoading,
    createClient,
    inviteUser,
    deleteClient,
    refreshClients: fetchClients
  };
};