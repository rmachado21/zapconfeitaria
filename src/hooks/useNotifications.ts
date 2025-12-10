import { useMemo } from 'react';
import { useClients } from './useClients';
import { useOrders } from './useOrders';
import { parseISO, isToday, isTomorrow, addDays, isBefore, isAfter, format, differenceInDays, getMonth, getDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Notification {
  id: string;
  type: 'birthday' | 'delivery';
  title: string;
  description: string;
  date: Date;
  priority: 'high' | 'medium' | 'low';
  icon: 'cake' | 'truck';
  clientName?: string;
  orderId?: string;
}

export function useNotifications() {
  const { clients } = useClients();
  const { orders } = useOrders();

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];
    const today = new Date();
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
      if (order.status === 'delivered') return; // Skip delivered orders

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

    // Sort by priority and date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return notifs.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.date.getTime() - b.date.getTime();
    });
  }, [clients, orders]);

  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;
  const totalCount = notifications.length;

  return {
    notifications,
    highPriorityCount,
    totalCount,
  };
}