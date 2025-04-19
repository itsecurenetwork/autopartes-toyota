
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDelivery } from '@/context/DeliveryContext';
import DeliveryItem from '@/components/DeliveryItem';
import PhotoCapture from '@/components/PhotoCapture';
import { useToast } from '@/components/ui/use-toast';

const Delivery = () => {
  const { deliveries, completeDelivery } = useDelivery();
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const { toast } = useToast();

  const pendingDeliveries = deliveries.filter(
    (delivery) => delivery.status === 'pending'
  );

  const handleComplete = (id: string) => {
    setActiveDeliveryId(id);
    setIsPhotoModalOpen(true);
  };

  const handlePhotoCapture = (photoData: string) => {
    if (activeDeliveryId) {
      completeDelivery(activeDeliveryId, photoData);
      setIsPhotoModalOpen(false);
      setActiveDeliveryId(null);
      
      toast({
        title: 'Entrega Completada',
        description: 'La entrega ha sido marcada como completada',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center justify-between mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-xl font-bold">App de Repartidor</h1>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mis Entregas</h2>
          <div className="flex items-center space-x-1">
            <div className="flex items-center text-sm">
              <Package className="mr-1 h-4 w-4" />
              <span>{pendingDeliveries.length} pendientes</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {pendingDeliveries.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No hay entregas pendientes</h3>
              <p className="text-muted-foreground">
                Todas las entregas han sido completadas
              </p>
            </div>
          ) : (
            pendingDeliveries.map((delivery) => (
              <DeliveryItem 
                key={delivery.id} 
                delivery={delivery} 
                onComplete={handleComplete}
                isDeliveryView={true}
              />
            ))
          )}
        </div>
      </div>

      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmación de Entrega</DialogTitle>
          </DialogHeader>
          <PhotoCapture onPhotoCapture={handlePhotoCapture} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Delivery;
