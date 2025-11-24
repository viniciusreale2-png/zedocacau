
export interface Company {
  id: string;
  name: string;
  managerName: string;
  phone: string;
  username: string;
  password?: string;
}

export interface User {
  id: string;
  name: string; // Apelido (para login)
  fullName: string;
  phone: string;
  address: string;
  password?: string;
  companyId: string;
  status: 'Ativo' | 'Pendente';
}

export interface PickupRequest {
  id: string;
  userId: string;
  companyId: string;
  fullBags: number;
  partialBagWeight: number;
  totalWeight: number;
  photoUrl: string;
  pickupDate: string;
  status: 'Agendado' | 'Concluído' | 'Cancelado' | 'Confirmado' | 'Reagendamento Proposto';
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  }
  confirmationCode?: string;
}

export interface CocoaQuantity {
    fullBags: number;
    partialBagWeight: number;
}

export interface AppNotification {
  id: string;
  companyId: string;
  message: string;
  date: string;
  read: boolean;
  type: 'new_pickup' | 'general';
  relatedId?: string; // ID do pedido relacionado
}
