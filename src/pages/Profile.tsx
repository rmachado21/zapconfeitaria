import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, ProfileFormData } from '@/hooks/useProfile';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { 
  User, 
  Building2, 
  LogOut, 
  Loader2,
  Save,
  CreditCard,
  Crown,
  CakeSlice,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  company_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100).optional().or(z.literal('')),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  pix_key: z.string().max(100).optional().or(z.literal('')),
  bank_details: z.string().max(500).optional().or(z.literal('')),
});

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const { clients } = useClients();
  const { products } = useProducts();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: '',
      logo_url: '',
      pix_key: '',
      bank_details: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        company_name: profile.company_name || '',
        logo_url: profile.logo_url || '',
        pix_key: profile.pix_key || '',
        bank_details: profile.bank_details || '',
      });
    }
  }, [profile, form]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta com sucesso.",
    });
  };

  const handleSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        {/* Profile Header */}
        <Card variant="gradient" className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-background flex items-center justify-center shadow-warm overflow-hidden border border-border">
                {profile?.logo_url ? (
                  <img 
                    src={profile.logo_url} 
                    alt="Logo" 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full gradient-warm flex items-center justify-center">
                    <CakeSlice className="h-10 w-10 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-display font-bold text-foreground">
                    {profile?.company_name || 'Minha Confeitaria'}
                  </h1>
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-display font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground">Pedidos</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-display font-bold text-primary">{clients.length}</p>
              <p className="text-xs text-muted-foreground">Clientes</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-display font-bold text-primary">{products.length}</p>
              <p className="text-xs text-muted-foreground">Produtos</p>
            </CardContent>
          </Card>
        </div>

        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Minha Confeitaria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo da Empresa</FormLabel>
                      <FormControl>
                        <ImageUpload
                          bucket="company-logos"
                          currentUrl={field.value}
                          onUpload={(url) => field.onChange(url)}
                          onRemove={() => field.onChange('')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t">
                  <h3 className="font-medium flex items-center gap-2 mb-4">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Dados para Pagamento
                  </h3>

                  <FormField
                    control={form.control}
                    name="pix_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave Pix</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com ou CPF/CNPJ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bank_details"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Dados Bancários (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Banco: Nubank&#10;Agência: 0001&#10;Conta: 12345678-9"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="warm" 
                  className="w-full"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar Alterações
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair da Conta
        </Button>
      </div>
    </AppLayout>
  );
};

export default Profile;
