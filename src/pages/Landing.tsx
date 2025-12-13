import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ClipboardList, Users, Package, Wallet, FileText, Smartphone, ArrowRight, Sparkles, Star } from 'lucide-react';
import logo from '@/assets/zap-confeitaria-logo.png';
import appMockup from '@/assets/app-mockup.png';

const features = [{
  icon: ClipboardList,
  title: 'Gestão de Pedidos',
  description: 'Kanban visual para acompanhar todos os pedidos, do orçamento à entrega.'
}, {
  icon: Users,
  title: 'Cadastro de Clientes',
  description: 'Organize seus clientes com telefone, endereço e aniversários para fidelização.'
}, {
  icon: Package,
  title: 'Catálogo de Produtos',
  description: 'Cadastre produtos com fotos, preços de custo e venda, por unidade, Kg ou cento.'
}, {
  icon: Wallet,
  title: 'Controle Financeiro',
  description: 'Acompanhe receitas, despesas, sinais pendentes e lucro bruto automaticamente.'
}, {
  icon: FileText,
  title: 'PDFs Profissionais',
  description: 'Gere orçamentos em PDF com sua logo, termos e dados de pagamento Pix.'
}, {
  icon: Smartphone,
  title: 'App Mobile (PWA)',
  description: 'Instale no celular como um app nativo. Funciona offline e notifica entregas.'
}];

const plans = [{
  id: 'monthly',
  name: 'Mensal',
  price: 'R$ 17,90',
  period: '/mês',
  description: 'Ideal para começar',
  features: ['Gestão de pedidos ilimitada', 'Cadastro de clientes', 'Catálogo de produtos', 'Controle financeiro', 'PDFs profissionais', 'App mobile (PWA)']
}, {
  id: 'yearly',
  name: 'Anual',
  price: 'R$ 189,90',
  period: '/ano',
  description: 'Economia de 12%',
  badge: 'Mais popular',
  features: ['Tudo do plano mensal', 'Economia de R$ 24,90', 'Suporte prioritário', 'Funcionalidades beta']
}];

const testimonials = [{
  name: 'Maria Silva',
  role: 'Confeiteira Artesanal',
  content: 'Antes eu perdia pedidos no WhatsApp. Agora tenho tudo organizado e nunca mais esqueci de cobrar o sinal!',
  rating: 5
}, {
  name: 'Ana Costa',
  role: 'Cake Designer',
  content: 'Os orçamentos em PDF deixaram meu trabalho muito mais profissional. Meus clientes adoram!',
  rating: 5
}, {
  name: 'Juliana Santos',
  role: 'Doceria Gourmet',
  content: 'O controle financeiro me mostrou onde eu estava perdendo dinheiro. Aumentei meu lucro em 30%!',
  rating: 5
}];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b animate-fade-in">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ZAP Confeitaria" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>
                Acessar App
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Entrar
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Começar Grátis
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-terracotta-light/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }} variant="secondary">
                <Sparkles className="h-3 w-3 mr-1" />
                Gestão completa para confeitarias
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Organize sua confeitaria e{' '}
                <span className="text-primary">aumente seus lucros</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                Chega de perder pedidos no WhatsApp e esquecer de cobrar o sinal. 
                Gerencie pedidos, clientes, produtos e finanças em um só lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 transition-transform hover:scale-105">
                  Começar agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="transition-transform hover:scale-105">
                  Ver funcionalidades
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                Escolha seu plano e comece hoje.
              </p>
            </div>

            {/* App Mockup */}
            <div className="flex justify-center lg:justify-end opacity-0 animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                {/* Glow effect behind mockup */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75" />
                <img 
                  src={appMockup} 
                  alt="ZAP Confeitaria App" 
                  className="relative w-72 md:w-80 lg:w-96 h-auto drop-shadow-2xl animate-float"
                  style={{ animationDelay: '0.5s' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para gerenciar sua confeitaria
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ferramentas simples e poderosas criadas especialmente para confeiteiras autônomas.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Confeiteiras que transformaram seus negócios
            </h2>
            <p className="text-muted-foreground text-lg">
              Veja o que dizem quem já usa o ZAP Confeitaria
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 fill-primary text-primary transition-transform duration-200" 
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <CardDescription className="text-foreground text-base">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos simples, sem surpresas
            </h2>
            <p className="text-muted-foreground text-lg">
              Escolha o plano ideal para o seu negócio
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  plan.badge ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary animate-pulse">
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
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full transition-transform hover:scale-[1.02]" 
                    size="lg" 
                    variant={plan.badge ? 'default' : 'outline'} 
                    onClick={handleGetStarted}
                  >
                    Começar agora
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Pagamento seguro via Stripe. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronta para organizar sua confeitaria?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Junte-se a centenas de confeiteiras que já usam o ZAP Confeitaria para crescer seus negócios.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 transition-transform hover:scale-105">
            Começar agora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="ZAP Confeitaria" className="h-6 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ZAP Confeitaria. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
