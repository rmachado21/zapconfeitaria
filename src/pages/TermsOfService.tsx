import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import logo from "@/assets/zap-confeitaria-logo.png";
import digitrailLogo from "@/assets/digitrail-logo.png";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ZAP Confeitaria" className="h-8 w-auto" />
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Termos de Serviço</h1>
        <p className="text-muted-foreground mb-8">Última atualização: 15 de dezembro de 2024</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar ou usar o ZAP Confeitaria, você concorda em ficar vinculado a estes Termos de Serviço. 
              Se você não concordar com qualquer parte destes termos, não poderá acessar ou utilizar nossos serviços.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Estes termos constituem um acordo legal entre você ("Usuário", "você") e ZAP Confeitaria ("nós", "nosso", "Plataforma").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              O ZAP Confeitaria é uma plataforma de gestão desenvolvida especificamente para confeitarias e 
              profissionais do ramo de confeitaria artesanal. Nossos serviços incluem:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Gestão de pedidos com acompanhamento por status (Kanban)</li>
              <li>Cadastro e gerenciamento de clientes</li>
              <li>Catálogo de produtos com preços e custos</li>
              <li>Controle financeiro (receitas, despesas, lucro bruto)</li>
              <li>Geração de orçamentos em PDF profissionais</li>
              <li>Integração com WhatsApp para comunicação com clientes</li>
              <li>Aplicativo móvel (PWA) para uso em dispositivos móveis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar o ZAP Confeitaria, você deve:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Ter pelo menos 18 anos de idade ou maioridade legal em sua jurisdição</li>
              <li>Fornecer informações verdadeiras, precisas e completas durante o cadastro</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Você é responsável por todas as atividades realizadas em sua conta. Não nos responsabilizamos 
              por perdas resultantes do uso não autorizado de sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Planos e Pagamentos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Oferecemos os seguintes planos de assinatura:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Plano Mensal:</strong> R$ 17,90 por mês</li>
              <li><strong>Plano Anual:</strong> R$ 189,90 por ano (economia de 12%)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Os pagamentos são processados de forma segura através do Stripe. Ao assinar, você autoriza 
              cobranças recorrentes de acordo com o plano escolhido.
            </p>
            <h3 className="text-lg font-medium mb-2 mt-4">4.1 Renovação Automática</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sua assinatura será renovada automaticamente ao final de cada período, a menos que você 
              cancele antes da data de renovação. Você pode cancelar a qualquer momento através das 
              configurações de sua conta.
            </p>
            <h3 className="text-lg font-medium mb-2 mt-4">4.2 Reembolsos</h3>
            <p className="text-muted-foreground leading-relaxed">
              Não oferecemos reembolsos por períodos parciais de assinatura. Ao cancelar, você manterá 
              acesso ao serviço até o final do período já pago.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Uso Aceitável</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ao utilizar o ZAP Confeitaria, você concorda em:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Usar o serviço apenas para fins legais e comerciais legítimos</li>
              <li>Não violar direitos de propriedade intelectual de terceiros</li>
              <li>Não transmitir malware, vírus ou código malicioso</li>
              <li>Não tentar acessar sistemas ou dados não autorizados</li>
              <li>Não usar o serviço para enviar spam ou comunicações não solicitadas</li>
              <li>Não revender ou redistribuir o serviço sem autorização</li>
              <li>Respeitar os direitos de privacidade de seus clientes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Seus Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você mantém todos os direitos sobre os dados que insere na plataforma (informações de clientes, 
              produtos, pedidos, transações). Você é responsável por:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Garantir a legalidade dos dados que cadastra</li>
              <li>Obter consentimento de seus clientes para armazenar suas informações</li>
              <li>Manter backups de dados importantes quando necessário</li>
              <li>Cumprir a legislação de proteção de dados aplicável (LGPD)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Concedemos a você uma licença para usar a plataforma, mas os dados inseridos permanecem de sua propriedade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              O ZAP Confeitaria, incluindo sua marca, logo, design, código-fonte, funcionalidades e todo 
              conteúdo original, são de propriedade exclusiva do ZAP Confeitaria e estão protegidos por 
              leis de propriedade intelectual.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Você não pode copiar, modificar, distribuir, vender ou alugar qualquer parte do serviço ou 
              software sem nossa autorização expressa por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O ZAP Confeitaria é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Ininterrupto, seguro ou livre de erros</li>
              <li>Adequado para todas as necessidades específicas do seu negócio</li>
              <li>Compatível com todos os dispositivos e navegadores</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Na máxima extensão permitida por lei, não seremos responsáveis por danos indiretos, 
              incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, dados 
              ou oportunidades de negócios.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses de assinatura.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Disponibilidade do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nos esforçamos para manter o serviço disponível 24 horas por dia, 7 dias por semana. 
              No entanto, o serviço pode ficar temporariamente indisponível para:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Manutenções programadas (comunicadas com antecedência quando possível)</li>
              <li>Atualizações e melhorias do sistema</li>
              <li>Problemas técnicos imprevistos</li>
              <li>Fatores fora de nosso controle (problemas de terceiros, força maior)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Cancelamento</h2>
            <h3 className="text-lg font-medium mb-2">10.1 Por Você</h3>
            <p className="text-muted-foreground leading-relaxed">
              Você pode cancelar sua assinatura a qualquer momento através das configurações de conta 
              ou do portal de gerenciamento de assinatura. O cancelamento será efetivado ao final do 
              período atual já pago.
            </p>
            <h3 className="text-lg font-medium mb-2 mt-4">10.2 Por Nós</h3>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de suspender ou encerrar sua conta em caso de:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Violação destes Termos de Serviço</li>
              <li>Uso fraudulento ou abusivo da plataforma</li>
              <li>Não pagamento de faturas após notificação</li>
              <li>Atividades ilegais realizadas através da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Alterações nos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar estes Termos de Serviço periodicamente. Notificaremos sobre mudanças 
              significativas através de aviso na plataforma ou por e-mail com pelo menos 30 dias de 
              antecedência. O uso continuado do serviço após as alterações constitui aceitação dos 
              novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Lei Aplicável e Foro</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes Termos de Serviço são regidos pelas leis da República Federativa do Brasil. 
              Qualquer disputa relacionada a estes termos será resolvida no foro da comarca de 
              domicílio do usuário, conforme previsto no Código de Defesa do Consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Disposições Gerais</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Se qualquer disposição destes termos for considerada inválida, as demais permanecerão em vigor</li>
              <li>Nossa falha em exercer qualquer direito não constitui renúncia a esse direito</li>
              <li>Estes termos constituem o acordo integral entre você e o ZAP Confeitaria</li>
              <li>Você não pode transferir seus direitos ou obrigações sem nossa autorização</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes Termos de Serviço, entre em contato:
            </p>
            <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-4">
              <li><strong>E-mail:</strong> contato@zapconfeitaria.com.br</li>
              <li><strong>Suporte:</strong> suporte@zapconfeitaria.com.br</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <img src={logo} alt="ZAP Confeitaria" className="h-6 w-auto" />
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Termos de Serviço
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} ZAP Confeitaria. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <a 
                href="mailto:suporte@zapconfeitaria.com.br" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                suporte@zapconfeitaria.com.br
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Feito com ❤️ por</span>
                <a href="https://digitrail.com.br" target="_blank" rel="noopener noreferrer">
                  <img src={digitrailLogo} alt="Digitrail" className="h-5 w-auto" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
