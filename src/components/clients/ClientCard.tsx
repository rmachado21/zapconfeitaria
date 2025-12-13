import { Client } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Cake, ChevronRight, Trash2, MapPin, ShoppingBag, CreditCard } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { maskCpfCnpj } from '@/lib/masks';
import { ptBR } from 'date-fns/locale';
import { openWhatsApp } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

interface ClientCardProps {
  client: Client & { orderCount?: number };
  onClick?: () => void;
  onDelete?: () => void;
}

export function ClientCard({ client, onClick, onDelete }: ClientCardProps) {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!client.phone) return;
    openWhatsApp(client.phone);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Card 
      variant="elevated" 
      className="cursor-pointer group hover:border-primary/30 animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-semibold text-sm">
              {getInitials(client.name)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
              {client.orderCount !== undefined && client.orderCount > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <ShoppingBag className="h-3 w-3" />
                  {client.orderCount}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 mt-1 text-xs text-muted-foreground">
              {client.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{client.address}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.birthday && (
                <div className="flex items-center gap-1">
                  <Cake className="h-3 w-3 flex-shrink-0" />
                  <span>
                    {format(parseISO(client.birthday), "dd 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
              )}
              {client.cpfCnpj && (
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 flex-shrink-0" />
                  <span className="font-mono text-[10px]">{maskCpfCnpj(client.cpfCnpj)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {client.phone && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-success hover:text-success hover:bg-success/10"
                onClick={handleWhatsAppClick}
              >
                <WhatsAppIcon className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
