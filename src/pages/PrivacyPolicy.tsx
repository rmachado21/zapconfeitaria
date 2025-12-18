import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import logo from "@/assets/zap-confeitaria-logo.png";
import digitrailLogo from "@/assets/digitrail-logo.png";

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-8">Última atualização: 15 de dezembro de 2024</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Informações Gerais</h2>
            <p className="text-muted-foreground leading-relaxed">
              O ZAP Confeitaria é uma plataforma de gestão desenvolvida para confeitarias e profissionais do ramo de 
              confeitaria artesanal. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e 
              protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Ao utilizar nossa plataforma, você concorda com as práticas descritas nesta política. Recomendamos a 
              leitura atenta deste documento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Dados que Coletamos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Coletamos os seguintes tipos de dados para fornecer nossos serviços:
            </p>
            
            <h3 className="text-lg font-medium mb-2">2.1 Dados de Cadastro</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>E-mail e senha (para autenticação)</li>
              <li>Nome da empresa/confeitaria</li>
              <li>Logo da empresa (opcional)</li>
              <li>Chave Pix para recebimentos (opcional)</li>
              <li>Dados bancários para orçamentos (opcional)</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-4">2.2 Dados de Clientes Cadastrados por Você</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Nome do cliente</li>
              <li>Telefone/WhatsApp</li>
              <li>Endereço</li>
              <li>CPF/CNPJ (opcional)</li>
              <li>Data de aniversário (opcional)</li>
              <li>E-mail (opcional)</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-4">2.3 Dados de Produtos e Pedidos</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Catálogo de produtos (nome, descrição, preços, fotos)</li>
              <li>Informações de pedidos (itens, valores, datas de entrega)</li>
              <li>Status de pagamentos (sinais, pagamentos completos)</li>
              <li>Notas e observações de pedidos</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-4">2.4 Dados Financeiros</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Transações de receitas e despesas</li>
              <li>Histórico de pagamentos da assinatura</li>
              <li>Informações de faturamento via Stripe</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-4">2.5 Dados de Uso</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Logs de acesso e navegação</li>
              <li>Preferências de interface</li>
              <li>Informações do dispositivo e navegador</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Finalidade do Tratamento</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos seus dados para as seguintes finalidades:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Prestação do serviço:</strong> Gerenciar seus pedidos, clientes, produtos e finanças</li>
              <li><strong>Geração de documentos:</strong> Criar orçamentos e relatórios em PDF com sua marca</li>
              <li><strong>Comunicação:</strong> Enviar notificações sobre pedidos, entregas e aniversários de clientes</li>
              <li><strong>Cobrança:</strong> Processar pagamentos da assinatura via Stripe</li>
              <li><strong>Melhorias:</strong> Analisar uso para aprimorar a plataforma</li>
              <li><strong>Suporte:</strong> Atender solicitações e resolver problemas técnicos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Base Legal</h2>
            <p className="text-muted-foreground leading-relaxed">
              O tratamento de dados é realizado com base nas seguintes hipóteses legais previstas na LGPD:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li><strong>Execução de contrato:</strong> Dados necessários para fornecer o serviço contratado</li>
              <li><strong>Consentimento:</strong> Para funcionalidades opcionais e comunicações de marketing</li>
              <li><strong>Legítimo interesse:</strong> Para melhorias na plataforma e prevenção de fraudes</li>
              <li><strong>Obrigação legal:</strong> Para cumprimento de obrigações fiscais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Seus dados podem ser compartilhados com os seguintes terceiros, exclusivamente para viabilizar nossos serviços:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Supabase:</strong> Infraestrutura de banco de dados, autenticação e armazenamento de arquivos</li>
              <li><strong>Stripe:</strong> Processamento de pagamentos e gestão de assinaturas</li>
              <li><strong>Google:</strong> Autenticação via Google Sign-In (quando utilizado)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Armazenamento e Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Adotamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Criptografia em trânsito (HTTPS/TLS)</li>
              <li>Criptografia de senhas com algoritmos seguros</li>
              <li>Políticas de segurança em nível de linha (Row Level Security - RLS)</li>
              <li>Acesso restrito baseado em autenticação</li>
              <li>Backups regulares dos dados</li>
              <li>Monitoramento contínuo de segurança</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Os dados são armazenados em servidores seguros fornecidos pela Supabase, com infraestrutura na nuvem.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados são mantidos enquanto sua conta estiver ativa ou conforme necessário para fornecer o serviço. 
              Após o cancelamento da conta, os dados podem ser retidos por até 30 dias para fins de backup e recuperação. 
              Dados necessários para cumprimento de obrigações legais podem ser mantidos por período superior.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Seus Direitos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Conforme a LGPD, você tem os seguintes direitos sobre seus dados pessoais:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou desatualizados</li>
              <li><strong>Anonimização ou bloqueio:</strong> Solicitar quando dados forem desnecessários ou excessivos</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Eliminação:</strong> Solicitar exclusão de dados tratados com base em consentimento</li>
              <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
              <li><strong>Informação:</strong> Saber com quem compartilhamos seus dados</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para exercer seus direitos, entre em contato através do e-mail: <strong>privacidade@zapconfeitaria.com.br</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Cookies e Tecnologias</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos as seguintes tecnologias de armazenamento local:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li><strong>Local Storage:</strong> Para armazenar preferências de interface e configurações do usuário</li>
              <li><strong>Session Storage:</strong> Para manter a sessão de autenticação</li>
              <li><strong>Cookies de autenticação:</strong> Gerenciados pelo Supabase para manter você conectado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas através 
              de aviso na plataforma ou por e-mail. Recomendamos revisar esta página regularmente para se manter 
              informado sobre nossas práticas de privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas, sugestões ou solicitações relacionadas à privacidade de dados, entre em contato:
            </p>
            <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-4">
              <li><strong>E-mail:</strong> privacidade@zapconfeitaria.com.br</li>
              <li><strong>Responsável:</strong> Equipe ZAP Confeitaria</li>
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
