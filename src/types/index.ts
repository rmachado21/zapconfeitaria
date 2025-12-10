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
  unitType: 'kg' | 'unit' | 'cento';
  imageUrl?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitType: 'kg' | 'unit' | 'cento';
  total: number;
  isGift?: boolean;
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
  dotColor: string;
  description: string;
  columnBg: string;
  columnBorder: string;
  headerBg: string;
}> = {
  quote: { 
    label: 'Orçamento', 
    color: 'text-slate-700 dark:text-slate-300', 
    bgColor: 'bg-slate-200 dark:bg-slate-700',
    dotColor: 'bg-slate-400 dark:bg-slate-500',
    description: 'Aguardando aprovação do cliente',
    columnBg: 'bg-slate-50 dark:bg-slate-900/50',
    columnBorder: 'border-slate-200 dark:border-slate-700',
    headerBg: 'bg-slate-100 dark:bg-slate-800',
  },
  awaiting_deposit: { 
    label: 'Aguardando Sinal', 
    color: 'text-amber-800 dark:text-amber-200', 
    bgColor: 'bg-amber-200 dark:bg-amber-800',
    dotColor: 'bg-amber-500 dark:bg-amber-400',
    description: 'Cliente aprovou, aguardando 50%',
    columnBg: 'bg-amber-50/50 dark:bg-amber-950/30',
    columnBorder: 'border-amber-200 dark:border-amber-800',
    headerBg: 'bg-amber-100 dark:bg-amber-900/50',
  },
  in_production: { 
    label: 'Em Produção', 
    color: 'text-primary-foreground', 
    bgColor: 'bg-primary',
    dotColor: 'bg-primary',
    description: 'Sinal recebido, em produção',
    columnBg: 'bg-primary/5 dark:bg-primary/10',
    columnBorder: 'border-primary/30 dark:border-primary/40',
    headerBg: 'bg-primary/15 dark:bg-primary/20',
  },
  ready: { 
    label: 'Pronto', 
    color: 'text-emerald-800 dark:text-emerald-200', 
    bgColor: 'bg-emerald-200 dark:bg-emerald-800',
    dotColor: 'bg-emerald-500 dark:bg-emerald-400',
    description: 'Finalizado, aguardando entrega',
    columnBg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
    columnBorder: 'border-emerald-200 dark:border-emerald-800',
    headerBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  delivered: { 
    label: 'Entregue', 
    color: 'text-sky-800 dark:text-sky-200', 
    bgColor: 'bg-sky-200 dark:bg-sky-800',
    dotColor: 'bg-sky-500 dark:bg-sky-400',
    description: 'Pedido entregue e pago',
    columnBg: 'bg-sky-50/50 dark:bg-sky-950/30',
    columnBorder: 'border-sky-200 dark:border-sky-800',
    headerBg: 'bg-sky-100 dark:bg-sky-900/50',
  },
};
