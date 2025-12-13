import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, User, Phone, CreditCard, Mail, CalendarDays, MapPin } from 'lucide-react';
import { Client, ClientFormData } from '@/hooks/useClients';
import { PhoneInput } from '@/components/shared/PhoneInput';
import { CpfCnpjInput } from '@/components/shared/CpfCnpjInput';
import { formatPhone, formatCpfCnpj } from '@/lib/masks';

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().optional(),
  cpf_cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birthday: z.string().optional(),
  address: z.string().max(500, 'Endereço muito longo').optional(),
});

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSubmit: (data: ClientFormData) => Promise<void>;
  isLoading: boolean;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSubmit,
  isLoading,
}: ClientFormDialogProps) {
  const isEditing = !!client;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      phone: '',
      cpf_cnpj: '',
      email: '',
      birthday: '',
      address: '',
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        phone: client.phone ? formatPhone(client.phone) : '',
        cpf_cnpj: client.cpf_cnpj ? formatCpfCnpj(client.cpf_cnpj) : '',
        email: client.email || '',
        birthday: client.birthday || '',
        address: client.address || '',
      });
    } else {
      form.reset({
        name: '',
        phone: '',
        cpf_cnpj: '',
        email: '',
        birthday: '',
        address: '',
      });
    }
  }, [client, form]);

  const handleSubmit = async (data: ClientFormData) => {
    await onSubmit(data);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col max-h-[80dvh]">
            <ScrollArea className="flex-1 max-h-[calc(80dvh-120px)]">
              <div className="space-y-4 pr-4">
                <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    Nome *
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </FormLabel>
                  <FormControl>
                    <PhoneInput 
                      placeholder="(11) 99999-9999" 
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf_cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4" />
                    CPF/CNPJ
                  </FormLabel>
                  <FormControl>
                    <CpfCnpjInput 
                      placeholder="123.456.789-00" 
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem className="overflow-hidden">
                  <FormLabel className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    Data de Aniversário
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="max-w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        Endereço / Referência
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Rua, número, bairro ou referência" 
                          className="resize-none"
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:justify-end border-t mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="warm" className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
