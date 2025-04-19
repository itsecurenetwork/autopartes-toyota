
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeliveryItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type DeliveryContextType = {
  deliveries: DeliveryItem[];
  addDelivery: (delivery: Omit<DeliveryItem, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  completeDelivery: (id: string, photo: string) => Promise<void>;
  getDeliveryById: (id: string) => DeliveryItem | undefined;
};

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const { toast } = useToast();

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDeliveries(data.map(delivery => ({
        id: delivery.id,
        address: delivery.address,
        clientName: delivery.client_name,
        status: delivery.status,
        notes: delivery.notes || undefined,
        createdAt: new Date(delivery.created_at).getTime(),
        completedAt: delivery.completed_at ? new Date(delivery.completed_at).getTime() : undefined,
        photo: delivery.photo || undefined,
      })));
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las entregas",
      });
    }
  };

  useEffect(() => {
    fetchDeliveries();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries'
        },
        () => {
          fetchDeliveries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addDelivery = async (delivery: Omit<DeliveryItem, 'id' | 'createdAt' | 'status'>) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .insert({
          client_name: delivery.clientName,
          address: delivery.address,
          notes: delivery.notes,
          status: 'pending',
        });

      if (error) throw error;

      await fetchDeliveries();
      
      toast({
        title: "Entrega creada",
        description: "La entrega ha sido programada exitosamente",
      });
    } catch (error) {
      console.error('Error adding delivery:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la entrega",
      });
    }
  };

  const completeDelivery = async (id: string, photo: string) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          photo: photo,
        })
        .eq('id', id);

      if (error) throw error;

      await fetchDeliveries();
      
      toast({
        title: "Entrega completada",
        description: "La entrega ha sido marcada como completada",
      });
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo completar la entrega",
      });
    }
  };

  const getDeliveryById = (id: string) => {
    return deliveries.find((delivery) => delivery.id === id);
  };

  return (
    <DeliveryContext.Provider
      value={{ deliveries, addDelivery, completeDelivery, getDeliveryById }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};
