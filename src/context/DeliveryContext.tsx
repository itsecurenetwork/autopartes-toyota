
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeliveryItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

type DeliveryContextType = {
  deliveries: DeliveryItem[];
  addDelivery: (delivery: Omit<DeliveryItem, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  completeDelivery: (id: string, photo: string) => Promise<void>;
  getDeliveryById: (id: string) => DeliveryItem | undefined;
};

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDeliveries();
    }
  }, [user]);

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*');

      if (error) throw error;

      setDeliveries(data.map(delivery => ({
        ...delivery,
        id: delivery.id,
        createdAt: new Date(delivery.created_at).getTime(),
        completedAt: delivery.completed_at ? new Date(delivery.completed_at).getTime() : undefined,
      })));
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las entregas',
        variant: 'destructive',
      });
    }
  };

  const addDelivery = async (delivery: Omit<DeliveryItem, 'id' | 'createdAt' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .insert([{
          address: delivery.address,
          client_name: delivery.clientName,
          notes: delivery.notes,
          status: 'pending',
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setDeliveries(prev => [...prev, {
        ...delivery,
        id: data.id,
        status: 'pending',
        createdAt: new Date(data.created_at).getTime(),
      }]);
    } catch (error) {
      console.error('Error adding delivery:', error);
      toast({
        title: 'Error',
        description: 'No se pudo agregar la entrega',
        variant: 'destructive',
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
          photo: photo
        })
        .eq('id', id);

      if (error) throw error;

      setDeliveries(prev => prev.map(delivery =>
        delivery.id === id
          ? {
              ...delivery,
              status: 'completed',
              completedAt: Date.now(),
              photo,
            }
          : delivery
      ));
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la entrega',
        variant: 'destructive',
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
