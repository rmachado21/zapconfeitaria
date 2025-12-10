export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  unitType: 'kg' | 'unit';
  imageUrl?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus = 
  | 'quote' 
  | 'awaiting_deposit' 
  | 'in_production' 
  | 'ready' 
  | 'delivered';

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  items: OrderItem[];
  status: OrderStatus;
  deliveryDate: string;
  deliveryAddress?: string;
  deliveryFee: number;
  totalAmount: number;
  depositPaid: boolean;
  depositAmount: number;
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  orderId?: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface User {
  id: string;
  email: string;
  companyName: string;
  logoUrl?: string;
  pixKey?: string;
  bankDetails?: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
  description: string;
}> = {
  quote: { 
    label: 'Orçamento', 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted',
    description: 'Aguardando aprovação do cliente'
  },
  awaiting_deposit: { 
    label: 'Aguardando Sinal', 
    color: 'text-warning-foreground', 
    bgColor: 'bg-warning',
    description: 'Cliente aprovou, aguardando 50%'
  },
  in_production: { 
    label: 'Em Produção', 
    color: 'text-primary-foreground', 
    bgColor: 'bg-primary',
    description: 'Sinal recebido, em produção'
  },
  ready: { 
    label: 'Pronto', 
    color: 'text-success-foreground', 
    bgColor: 'bg-success',
    description: 'Finalizado, aguardando entrega'
  },
  delivered: { 
    label: 'Entregue', 
    color: 'text-accent-foreground', 
    bgColor: 'bg-accent',
    description: 'Pedido entregue e pago'
  },
};
