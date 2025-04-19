
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDelivery } from '@/context/DeliveryContext';
import AddDeliveryForm from '@/components/AddDeliveryForm';
import DeliveryItem from '@/components/DeliveryItem';

const Manager = () => {
  const { deliveries } = useDelivery();
  const [activeTab, setActiveTab] = useState('all');

  const pendingDeliveries = deliveries.filter(
    (delivery) => delivery.status === 'pending'
  );
  
  const completedDeliveries = deliveries.filter(
    (delivery) => delivery.status === 'completed'
  );

  const filteredDeliveries = activeTab === 'pending' 
    ? pendingDeliveries 
    : activeTab === 'completed' 
      ? completedDeliveries 
      : deliveries;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Panel de Manager</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Agregar Entrega</h2>
          <AddDeliveryForm />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Entregas</h2>
            <div className="flex items-center space-x-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                <span>{pendingDeliveries.length} pendientes</span>
              </div>
              <div className="text-muted-foreground mx-2">•</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                <span>{completedDeliveries.length} completadas</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="completed">Completadas</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="space-y-4">
                {deliveries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay entregas programadas
                  </div>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <DeliveryItem key={delivery.id} delivery={delivery} />
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <div className="space-y-4">
                {pendingDeliveries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay entregas pendientes
                  </div>
                ) : (
                  pendingDeliveries.map((delivery) => (
                    <DeliveryItem key={delivery.id} delivery={delivery} />
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <div className="space-y-4">
                {completedDeliveries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay entregas completadas
                  </div>
                ) : (
                  completedDeliveries.map((delivery) => (
                    <DeliveryItem key={delivery.id} delivery={delivery} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Manager;
