
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeliveryItem as DeliveryItemType } from '@/types';
import { CheckCircle, MapPin, User, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DeliveryItemProps {
  delivery: DeliveryItemType;
  onComplete?: (id: string) => void;
  isDeliveryView?: boolean;
}

const DeliveryItem: React.FC<DeliveryItemProps> = ({ delivery, onComplete, isDeliveryView = false }) => {
  const { id, address, clientName, status, notes, createdAt, completedAt, photo } = delivery;

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'PPp', { locale: es });
  };

  return (
    <Card className={`w-full ${status === 'completed' ? 'bg-gray-50' : 'bg-white'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{clientName}</CardTitle>
          <Badge variant={status === 'completed' ? 'secondary' : 'default'}>
            {status === 'completed' ? 'Completado' : 'Pendiente'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="text-sm">{address}</p>
        </div>
        
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="text-sm">Creado: {formatDate(createdAt)}</p>
        </div>
        
        {notes && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">{notes}</p>
          </div>
        )}

        {status === 'completed' && completedAt && (
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <p className="text-sm">Completado: {formatDate(completedAt)}</p>
          </div>
        )}

        {status === 'completed' && photo && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Foto de confirmación:</p>
            <img src={photo} alt="Confirmación de entrega" className="w-full h-40 object-cover rounded-md" />
          </div>
        )}
      </CardContent>
      
      {status !== 'completed' && isDeliveryView && onComplete && (
        <CardFooter>
          <Button 
            onClick={() => onComplete(id)} 
            className="w-full"
          >
            Completar Entrega
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default DeliveryItem;
