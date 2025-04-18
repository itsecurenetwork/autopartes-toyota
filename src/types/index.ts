
export interface DeliveryItem {
  id: string;
  address: string;
  clientName: string;
  status: 'pending' | 'completed';
  notes?: string;
  createdAt: number;
  completedAt?: number;
  photo?: string;
}
