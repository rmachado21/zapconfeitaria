import { useMemo } from 'react';
import { useClients } from './useClients';
import { useOrders } from './useOrders';
import { useProfile } from './useProfile';
import { parseISO, isToday, isTomorrow, addDays, isBefore, format, differenceInDays, getMonth, getDate, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Notification {
  id: string;
  type: 'birthday' | 'delivery' | 'deposit_overdue' | 'pwa_install';
  title: string;
  description: string;
  date: Date;
  priority: 'high' | 'medium' | 'low';
  icon: 'cake' | 'truck' | 'alert' | 'smartphone';
  clientName?: string;
  orderId?: string;
  // Extra fields for template processing
  orderNumber?: number | null;
  totalAmount?: number;
  deliveryDate?: string | null;
  deliveryTime?: string | null;
}

export function useNotifications() {
  const { clients } = useClients();
  const { orders } = useOrders();
  const { profile } = useProfile();

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];
    const today = startOfDay(new Date());

    // Check if PWA install suggestion should be shown
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const showPWASuggestion = isMobile && !isPWA && profile && !profile.pwa_install_suggested;

    if (showPWASuggestion) {
      notifs.push({
        id: 'pwa-install-suggestion',
        type: 'pwa_install',
        title: 'Instale o App',
        description: 'Adicione à tela inicial para acesso rápido',
        date: new Date(),
        priority: 'medium',
        icon: 'smartphone',
      });
    }
    const nextWeek = addDays(today, 7);

    // Check birthdays
    clients.forEach(client => {
      if (!client.birthday) return;

      try {
        const birthday = parseISO(client.birthday);
        const thisYearBirthday = new Date(
          today.getFullYear(),
          getMonth(birthday),
          getDate(birthday)
        );

        // If birthday already passed this year, check next year
        if (isBefore(thisYearBirthday, today) && !isToday(thisYearBirthday)) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Check if birthday is within next 7 days
        if (isBefore(thisYearBirthday, nextWeek) || isToday(thisYearBirthday)) {
          const daysUntil = differenceInDays(thisYearBirthday, today);
          
          let priority: 'high' | 'medium' | 'low' = 'low';
          let description = '';

          if (isToday(thisYearBirthday)) {
            priority = 'high';
            description = 'Aniversário é hoje! 🎂';
          } else if (isTomorrow(thisYearBirthday)) {
            priority = 'high';
            description = 'Aniversário é amanhã!';
          } else if (daysUntil <= 3) {
            priority = 'medium';
            description = `Aniversário em ${daysUntil} dias`;
          } else {
            priority = 'low';
            description = `Aniversário em ${daysUntil} dias (${format(thisYearBirthday, "dd 'de' MMM", { locale: ptBR })})`;
          }

          notifs.push({
            id: `birthday-${client.id}`,
            type: 'birthday',
            title: client.name,
            description,
            date: thisYearBirthday,
            priority,
            icon: 'cake',
            clientName: client.name,
          });
        }
      } catch (e) {
        // Invalid date, skip
      }
    });

    // Check upcoming deliveries
    orders.forEach(order => {
      if (!order.delivery_date) return;
      if (order.status === 'delivered' || order.status === 'cancelled') return; // Skip delivered/cancelled orders

      try {
        const deliveryDate = parseISO(order.delivery_date);

        // Only check future deliveries or today
        if (isBefore(deliveryDate, today) && !isToday(deliveryDate)) return;

        // Check if delivery is within next 7 days
        if (isBefore(deliveryDate, nextWeek) || isToday(deliveryDate)) {
          const daysUntil = differenceInDays(deliveryDate, today);
          
          let priority: 'high' | 'medium' | 'low' = 'low';
          let description = '';

          if (isToday(deliveryDate)) {
            priority = 'high';
            description = 'Entrega é hoje! 📦';
          } else if (isTomorrow(deliveryDate)) {
            priority = 'high';
            description = 'Entrega é amanhã!';
          } else if (daysUntil <= 3) {
            priority = 'medium';
            description = `Entrega em ${daysUntil} dias`;
          } else {
            priority = 'low';
            description = `Entrega em ${daysUntil} dias (${format(deliveryDate, "dd 'de' MMM", { locale: ptBR })})`;
          }

          const clientName = order.client?.name || 'Cliente não definido';

          notifs.push({
            id: `delivery-${order.id}`,
            type: 'delivery',
            title: `Pedido - ${clientName}`,
            description,
            date: deliveryDate,
            priority,
            icon: 'truck',
            clientName,
            orderId: order.id,
          });
        }
      } catch (e) {
        // Invalid date, skip
      }
    });

    // Check overdue deposits (pending for more than 7 days)
    orders.forEach(order => {
      if (order.deposit_paid) return; // Skip if deposit already paid
      if (order.full_payment_received) return; // Skip if full payment already received
      if (order.status === 'delivered' || order.status === 'cancelled') return; // Skip finished orders
      if (order.status !== 'quote' && order.status !== 'awaiting_deposit') return; // Only check early status orders

      try {
        const createdDate = parseISO(order.created_at);
        const daysSinceCreation = differenceInDays(today, startOfDay(createdDate));

        if (daysSinceCreation >= 7) {
          const clientName = order.client?.name || 'Cliente não definido';

          notifs.push({
            id: `deposit-overdue-${order.id}`,
            type: 'deposit_overdue',
            title: `Pedido - ${clientName}`,
            description: `Sinal pendente há ${daysSinceCreation} dias`,
            date: createdDate,
            priority: daysSinceCreation >= 14 ? 'high' : 'medium',
            icon: 'alert',
            clientName,
            orderId: order.id,
            // Extra fields for template processing
            orderNumber: order.order_number,
            totalAmount: order.total_amount,
            deliveryDate: order.delivery_date,
            deliveryTime: order.delivery_time,
          });
        }
      } catch (e) {
        // Invalid date, skip
      }
    });

    // Sort by priority and date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return notifs.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.date.getTime() - b.date.getTime();
    });
  }, [clients, orders, profile]);

  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;
  const totalCount = notifications.length;

  return {
    notifications,
    highPriorityCount,
    totalCount,
  };
}