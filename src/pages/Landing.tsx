import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ClipboardList, Users, Package, Wallet, FileText, Smartphone, ArrowRight, Sparkles, Star } from 'lucide-react';
import logo from '@/assets/zap-confeitaria-logo.png';
import appMockup from '@/assets/app-mockup.png';
import desktopMockup from '@/assets/desktop-mockup.png';
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
  const {
    user
  } = useAuth();
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  return <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b animate-fade-in">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ZAP Confeitaria" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            {user ? <Button onClick={() => navigate('/dashboard')}>
                Acessar App
              </Button> : <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Entrar
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Criar Conta
                </Button>
              </>}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-terracotta-light/10 rounded-full blur-3xl animate-float" style={{
          animationDelay: '1.5s'
        }} />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-4 opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.1s'
            }} variant="secondary">
                <Sparkles className="h-3 w-3 mr-1" />
                Gestão completa para confeitarias
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.2s'
            }}>
                Organize sua confeitaria e{' '}
                <span className="text-primary">aumente seus lucros</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.3s'
            }}>
                Chega de perder pedidos no WhatsApp e esquecer de cobrar o sinal. 
                Gerencie pedidos, clientes, produtos e finanças em um só lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.4s'
            }}>
                <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 transition-transform hover:scale-105">
                  Começar agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({
                behavior: 'smooth'
              })} className="transition-transform hover:scale-105">
                  Ver funcionalidades
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4 opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.5s'
            }}>
                Escolha seu plano e comece hoje.
              </p>
            </div>

            {/* Device Mockups - Desktop + Mobile Overlay */}
            <div className="flex justify-center lg:justify-end animate-slide-in-right" style={{
            animationDelay: '0.3s',
            animationFillMode: 'both'
          }}>
              <div className="relative">
                {/* Glow effect behind mockups */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-90" />
                
                {/* Desktop Mockup */}
                <div className="relative animate-float" style={{
                animationDelay: '0.3s'
              }}>
                  {/* Monitor Frame */}
                  <div className="relative w-[240px] sm:w-[320px] md:w-[400px] lg:w-[480px] xl:w-[520px]">
                    {/* Monitor body */}
                    <div className="bg-gray-800 rounded-lg pt-2 sm:pt-3 md:pt-4 px-1.5 sm:px-2 md:px-3 pb-1.5 sm:pb-2 md:pb-3 shadow-2xl">
                      {/* Browser bar */}
                      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5 md:mb-2 px-1 sm:px-1.5 md:px-2">
                        <div className="flex gap-1 sm:gap-1.5">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-500" />
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-500" />
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500" />
                        </div>
                        <div className="flex-1 bg-gray-700 rounded h-3 sm:h-4 md:h-5 ml-1 sm:ml-1.5 md:ml-2" />
                      </div>
                      {/* Screenshot */}
                      <img src={desktopMockup} alt="ZAP Confeitaria Desktop" className="rounded w-full h-auto" />
                    </div>
                    {/* Monitor stand */}
                    <div className="w-8 sm:w-12 md:w-16 h-3 sm:h-4 md:h-6 mx-auto bg-gray-700 rounded-b-sm" />
                    <div className="w-12 sm:w-16 md:w-24 h-1 sm:h-1.5 md:h-2 mx-auto bg-gray-600 rounded-b-lg" />
                  </div>
                </div>
                
                {/* Mobile Mockup - Overlaps desktop */}
                <div className="absolute -bottom-4 -right-2 sm:-bottom-5 sm:-right-3 md:-bottom-6 md:-right-4 lg:-bottom-4 lg:-right-4 z-10 w-24 sm:w-32 md:w-44 lg:w-52 animate-float" style={{
                animationDelay: '0.6s'
              }}>
                  {/* Phone body */}
                  <div className="relative bg-gray-900 rounded-[1rem] sm:rounded-[1.25rem] md:rounded-[1.5rem] lg:rounded-[2rem] p-1 sm:p-1 md:p-1 lg:p-1.5 shadow-2xl ring-2 sm:ring-4 ring-background">
                    {/* Top notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 sm:w-10 md:w-12 lg:w-16 h-2 sm:h-2.5 md:h-3 lg:h-4 bg-gray-900 rounded-b-xl z-10" />
                    
                    {/* Screen */}
                    <div className="relative rounded-[0.75rem] sm:rounded-[1rem] md:rounded-[1.25rem] lg:rounded-[1.5rem] overflow-hidden bg-black">
                      <img src={appMockup} alt="ZAP Confeitaria Mobile" className="w-full h-auto" />
                    </div>
                    
                    {/* Side buttons */}
                    <div className="absolute -right-0.5 top-8 sm:top-10 md:top-12 lg:top-16 w-0.5 h-3 sm:h-4 md:h-4 lg:h-6 bg-gray-700 rounded-r-sm" />
                    <div className="absolute -right-0.5 top-12 sm:top-16 md:top-18 lg:top-24 w-0.5 h-4 sm:h-5 md:h-6 lg:h-8 bg-gray-700 rounded-r-sm" />
                    <div className="absolute -left-0.5 top-10 sm:top-12 md:top-14 lg:top-20 w-0.5 h-3 sm:h-4 md:h-5 lg:h-6 bg-gray-700 rounded-l-sm" />
                  </div>
                </div>

                {/* Badge - Use anywhere */}
                <div className="flex absolute -bottom-10 sm:-bottom-12 md:-bottom-14 left-1/2 -translate-x-1/2 items-center gap-1.5 sm:gap-2 bg-muted/80 backdrop-blur-sm rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 shadow-lg animate-fade-in" style={{
                animationDelay: '0.8s'
              }}>
                  <span className="text-lg">📱💻</span>
                  <span className="text-sm font-medium text-muted-foreground">Use no celular, tablet ou no computador</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Em 3 passos simples você organiza toda sua confeitaria
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                {/* Connector line - hidden on mobile */}
                <div className="hidden md:block absolute top-1/2 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-border" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cadastre seus produtos</h3>
              <p className="text-muted-foreground">
                Adicione seu catálogo com fotos, preços e custos para calcular lucros automaticamente.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                {/* Connector line - hidden on mobile */}
                <div className="hidden md:block absolute top-1/2 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-border" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Crie pedidos e orçamentos</h3>
              <p className="text-muted-foreground">
                Gere PDFs profissionais e envie pelo WhatsApp. Nunca mais esqueça de cobrar o sinal.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Acompanhe tudo no Kanban</h3>
              <p className="text-muted-foreground">
                Visualize seus pedidos do orçamento à entrega e controle seu financeiro em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div className="group">
              <p className="text-3xl md:text-4xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                500+
              </p>
              <p className="text-muted-foreground mt-1">Confeiteiras ativas</p>
            </div>
            <div className="group">
              <p className="text-3xl md:text-4xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                15.000+
              </p>
              <p className="text-muted-foreground mt-1">Pedidos gerenciados</p>
            </div>
            <div className="group">
              <p className="text-3xl md:text-4xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                R$ 2M+
              </p>
              <p className="text-muted-foreground mt-1">Em vendas processadas</p>
            </div>
            <div className="group">
              <p className="text-3xl md:text-4xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                4.9★
              </p>
              <p className="text-muted-foreground mt-1">Avaliação média</p>
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
            {features.map((feature, index) => <Card key={index} className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
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
            {testimonials.map((testimonial, index) => <Card key={index} className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary transition-transform duration-200" style={{
                  animationDelay: `${i * 0.1}s`
                }} />)}
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
              </Card>)}
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
            {plans.map((plan, index) => <Card key={plan.id} className={`relative flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.badge ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
                {plan.badge && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary animate-pulse">
                    {plan.badge}
                  </Badge>}
                
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
                    {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>)}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full transition-transform hover:scale-[1.02]" size="lg" variant={plan.badge ? 'default' : 'outline'} onClick={handleGetStarted}>
                    Começar agora
                  </Button>
                </CardFooter>
              </Card>)}
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
    </div>;
}