import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useSubscription } from '@/hooks/useSubscription';
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
  FileText,
  Hash,
  Calendar,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Smartphone,
  Star,
} from 'lucide-react';
import { PWAInstallGuide } from '@/components/shared/PWAInstallGuide';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const profileSchema = z.object({
  company_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100).optional().or(z.literal('')),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  pix_key: z.string().max(100).optional().or(z.literal('')),
  bank_details: z.string().max(500).optional().or(z.literal('')),
  include_terms_in_pdf: z.boolean().optional(),
  custom_terms: z.string().max(2000).optional().or(z.literal('')),
  order_number_start: z.coerce.number().min(1, 'Número deve ser no mínimo 1').optional(),
  google_review_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

const DEFAULT_TERMS = `• O pedido será confirmado após o pagamento de 50% do valor total (sinal).
• O restante deve ser pago na entrega/retirada do pedido.
• Cancelamentos com menos de 48h de antecedência não terão reembolso do sinal.
• Alterações devem ser solicitadas com pelo menos 72h de antecedência.`;

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const { 
    subscription, 
    isLoading: subscriptionLoading, 
    openCustomerPortal, 
    checkSubscription,
    isActive 
  } = useSubscription();
  const { clients } = useClients();
  const { products } = useProducts();
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: '',
      logo_url: '',
      pix_key: '',
      bank_details: '',
      include_terms_in_pdf: true,
      custom_terms: '',
      order_number_start: 1,
      google_review_url: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        company_name: profile.company_name || '',
        logo_url: profile.logo_url || '',
        pix_key: profile.pix_key || '',
        bank_details: profile.bank_details || '',
        include_terms_in_pdf: profile.include_terms_in_pdf ?? true,
        custom_terms: profile.custom_terms || DEFAULT_TERMS,
        order_number_start: profile.order_number_start || 1,
        google_review_url: profile.google_review_url || '',
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

  const handleOpenPortal = async () => {
    try {
      setPortalLoading(true);
      await openCustomerPortal();
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de assinatura.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleRefreshSubscription = async () => {
    try {
      setRefreshing(true);
      await checkSubscription();
      toast({
        title: "Atualizado",
        description: "Status da assinatura atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getPlanLabel = (planType: string | null) => {
    switch (planType) {
      case 'monthly': return 'Mensal';
      case 'yearly': return 'Anual';
      default: return 'Desconhecido';
    }
  };

  const getPlanPrice = (planType: string | null) => {
    switch (planType) {
      case 'monthly': return 'R$ 17,90/mês';
      case 'yearly': return 'R$ 189,90/ano';
      default: return '';
    }
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
      <div className="px-5 py-4 md:px-8 md:py-6 space-y-6 max-w-2xl mx-auto">
        {/* Profile Header */}
        <Card variant="gradient" className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-2xl bg-background flex items-center justify-center shadow-warm overflow-hidden border border-border flex-shrink-0">
                {profile?.logo_url ? (
                  <img 
                    src={profile.logo_url} 
                    alt="Logo" 
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <div className="w-full h-full gradient-warm flex items-center justify-center">
                    <CakeSlice className="h-10 w-10 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-lg md:text-xl font-display font-bold text-foreground truncate max-w-[200px] md:max-w-none">
                    {profile?.company_name || 'Minha Confeitaria'}
                  </h1>
                  {isActive && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 flex-shrink-0">
                      <Crown className="h-3 w-3 mr-1" />
                      {getPlanLabel(subscription.planType)}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm truncate">{user?.email}</p>
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

        {/* Install App Section */}
        <Card className="border-dashed">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Instalar no celular</p>
                <p className="text-xs text-muted-foreground">Acesse como um app nativo</p>
              </div>
            </div>
            <PWAInstallGuide />
          </CardContent>
        </Card>

        {/* Tabs for Profile and Subscription */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Assinatura
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4 space-y-4">
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

                    <div className="pt-4 border-t">
                      <h3 className="font-medium flex items-center gap-2 mb-4">
                        <Star className="h-4 w-4 text-primary" />
                        Avaliação Google
                      </h3>

                      <FormField
                        control={form.control}
                        name="google_review_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link de Avaliação do Google</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://g.page/r/..." 
                                {...field} 
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Cole aqui o link do seu Google Meu Negócio para solicitar avaliações aos clientes
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-medium flex items-center gap-2 mb-4">
                        <FileText className="h-4 w-4 text-primary" />
                        Configurações do PDF
                      </h3>

                      <FormField
                        control={form.control}
                        name="order_number_start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Pedidos iniciam em
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1}
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Ex: 100 para começar em #0100
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="include_terms_in_pdf"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 mt-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">
                                Incluir Termos de Serviço
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">
                                Exibir termos de serviço no PDF de orçamento
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="custom_terms"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Termos de Serviço</FormLabel>
                            <FormControl>
                              <Textarea
                                className="resize-y text-sm min-h-[120px]"
                                rows={8}
                                placeholder="Adicione cada termo em uma nova linha..."
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Cada linha será um item separado no PDF. Use Enter para adicionar novos termos.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {field.value?.length || 0}/2000 caracteres
                            </p>
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
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Crown className="h-5 w-5 text-primary" />
                      Sua Assinatura
                    </CardTitle>
                    <CardDescription>Gerencie seu plano e pagamentos</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleRefreshSubscription}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscriptionLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : isActive ? (
                  <>
                    {/* Active Subscription */}
                    <div className="rounded-lg border bg-primary/5 p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="font-medium">Assinatura Ativa</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Plano {getPlanLabel(subscription.planType)}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                          {getPlanPrice(subscription.planType)}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        {subscription.subscriptionEnd && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {subscription.cancelAtPeriodEnd 
                                ? `Acesso até ${format(new Date(subscription.subscriptionEnd), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                                : `Renova em ${format(new Date(subscription.subscriptionEnd), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                              }
                            </span>
                          </div>
                        )}

                        {subscription.cancelAtPeriodEnd && (
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Cancelamento agendado</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Manage Subscription */}
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleOpenPortal}
                        disabled={portalLoading}
                      >
                        {portalLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ExternalLink className="mr-2 h-4 w-4" />
                        )}
                        Gerenciar Assinatura
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Alterar plano, forma de pagamento ou cancelar
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* No Active Subscription */}
                    <div className="rounded-lg border bg-muted/50 p-6 text-center">
                      <Crown className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Nenhuma assinatura ativa</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Assine para ter acesso completo ao ZAP Confeitaria
                      </p>
                      <Button 
                        onClick={() => window.location.href = '/pricing'}
                        className="w-full"
                      >
                        Ver Planos
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
