import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Loader2, Crown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const plans = [
  {
    id: 'monthly',
    name: 'Mensal',
    price: 'R$ 17,90',
    period: '/mês',
    description: 'Ideal para começar',
    features: [
      'Gestão de pedidos ilimitada',
      'Cadastro de clientes',
      'Catálogo de produtos',
      'Controle financeiro',
      'PDFs profissionais',
      'App mobile (PWA)',
      'Suporte por email',
    ],
  },
  {
    id: 'yearly',
    name: 'Anual',
    price: 'R$ 189,90',
    period: '/ano',
    description: 'Economia de 12%',
    badge: 'Mais popular',
    features: [
      'Tudo do plano mensal',
      'Economia de R$ 24,90',
      'Suporte prioritário',
      'Funcionalidades beta',
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { createCheckout, isLoading: subscriptionLoading, isActive } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Redirect to dashboard if already subscribed
  useEffect(() => {
    if (isActive) {
      navigate('/dashboard', { replace: true });
    }
  }, [isActive, navigate]);

  // Show loading while checking subscription status
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleSelectPlan = async (planId: 'monthly' | 'yearly') => {
    try {
      setLoadingPlan(planId);
      await createCheckout(planId);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao iniciar checkout. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o início
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold">Escolha seu plano</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Para acessar o ZAP Confeitaria, escolha o plano que melhor se adapta às suas necessidades.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative flex flex-col ${plan.badge ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  {plan.badge}
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  variant={plan.badge ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.id as 'monthly' | 'yearly')}
                  disabled={subscriptionLoading || loadingPlan !== null}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Assinar agora'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-sm text-muted-foreground">
            Pagamento seguro via Stripe. Cancele quando quiser.
          </p>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
