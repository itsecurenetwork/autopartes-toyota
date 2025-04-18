
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDelivery } from '@/context/DeliveryContext';
import { toast } from '@/components/ui/use-toast';

type FormValues = {
  address: string;
  clientName: string;
  notes: string;
};

const AddDeliveryForm = () => {
  const { addDelivery } = useDelivery();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    addDelivery({
      address: data.address,
      clientName: data.clientName,
      notes: data.notes,
    });

    toast({
      title: 'Entrega agregada',
      description: 'La entrega ha sido programada exitosamente',
    });

    reset();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agregar Nueva Entrega</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre del Cliente</Label>
            <Input
              id="clientName"
              {...register('clientName', { required: 'Este campo es requerido' })}
            />
            {errors.clientName && (
              <p className="text-sm text-red-500">{errors.clientName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              {...register('address', { required: 'Este campo es requerido' })}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Agregar Entrega
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddDeliveryForm;
