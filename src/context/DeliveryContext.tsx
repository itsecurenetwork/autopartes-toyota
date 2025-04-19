
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeliveryItem } from '@/types';

type DeliveryContextType = {
  deliveries: DeliveryItem[];
  addDelivery: (delivery: Omit<DeliveryItem, 'id' | 'createdAt' | 'status'>) => void;
  completeDelivery: (id: string, photo: string) => void;
  getDeliveryById: (id: string) => DeliveryItem | undefined;
};

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);

  // Load deliveries from localStorage on component mount
  useEffect(() => {
    const savedDeliveries = localStorage.getItem('deliveries');
    if (savedDeliveries) {
      setDeliveries(JSON.parse(savedDeliveries));
    }
  }, []);

  // Save deliveries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  const addDelivery = (delivery: Omit<DeliveryItem, 'id' | 'createdAt' | 'status'>) => {
    const newDelivery: DeliveryItem = {
      ...delivery,
      id: Date.now().toString(),
      createdAt: Date.now(),
      status: 'pending',
    };
    setDeliveries([...deliveries, newDelivery]);
  };

  const completeDelivery = (id: string, photo: string) => {
    setDeliveries(
      deliveries.map((delivery) =>
        delivery.id === id
          ? {
              ...delivery,
              status: 'completed',
              completedAt: Date.now(),
              photo,
            }
          : delivery
      )
    );
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
