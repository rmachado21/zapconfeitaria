import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22?deps=react@18.3.1'
import * as React from 'https://esm.sh/react@18.3.1'

interface PasswordResetEmailProps {
  resetLink: string
  userEmail: string
}

export const PasswordResetEmail = ({
  resetLink,
  userEmail,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Redefina sua senha do ZAP Confeitaria</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={logoSection}>
          <Img
            src="https://zapconfeitaria.com.br/favicon.png"
            width="60"
            height="60"
            alt="ZAP Confeitaria"
            style={logo}
          />
          <Heading style={brandName}>ZAP Confeitaria</Heading>
        </Section>

        <Hr style={divider} />

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Redefinir sua senha</Heading>
          
          <Text style={paragraph}>
            Olá! Recebemos uma solicitação para redefinir a senha da conta associada ao email{' '}
            <strong>{userEmail}</strong>.
          </Text>

          <Text style={paragraph}>
            Clique no botão abaixo para criar uma nova senha:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Redefinir minha senha
            </Button>
          </Section>

          <Text style={smallText}>
            Este link é válido por <strong>24 horas</strong>. Após esse período, você precisará solicitar uma nova redefinição.
          </Text>

          <Hr style={dividerLight} />

          <Text style={securityNote}>
            🔒 <strong>Dica de segurança:</strong> Se você não solicitou esta redefinição de senha, pode ignorar este email com segurança. Sua senha atual permanecerá inalterada.
          </Text>

          <Text style={alternativeLink}>
            Não consegue clicar no botão? Copie e cole este link no seu navegador:
          </Text>
          <Text style={linkText}>
            <Link href={resetLink} style={link}>
              {resetLink}
            </Link>
          </Text>
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            ZAP Confeitaria - Gestão completa para sua confeitaria
          </Text>
          <Text style={footerSubtext}>
            © {new Date().getFullYear()} ZAP Confeitaria. Todos os direitos reservados.
          </Text>
          <Text style={footerLinks}>
            <Link href="https://zapconfeitaria.com.br/privacy" style={footerLink}>
              Política de Privacidade
            </Link>
            {' • '}
            <Link href="https://zapconfeitaria.com.br/terms" style={footerLink}>
              Termos de Uso
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

// Styles
const main = {
  backgroundColor: '#f6f5f3',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
}

const logoSection = {
  backgroundColor: '#c2410c',
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto 12px',
  borderRadius: '12px',
}

const brandName = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '-0.5px',
}

const content = {
  padding: '40px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#c2410c',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 2px 4px rgba(194, 65, 12, 0.2)',
}

const smallText = {
  color: '#6b6b6b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const securityNote = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 24px',
  padding: '16px',
}

const alternativeLink = {
  color: '#6b6b6b',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 8px',
}

const linkText = {
  margin: '0',
  wordBreak: 'break-all' as const,
}

const link = {
  color: '#c2410c',
  fontSize: '12px',
  textDecoration: 'underline',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '0',
}

const dividerLight = {
  borderColor: '#f0f0f0',
  margin: '24px 0',
}

const footer = {
  backgroundColor: '#fafaf9',
  padding: '24px 40px',
}

const footerText = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
  textAlign: 'center' as const,
}

const footerSubtext = {
  color: '#8a8a8a',
  fontSize: '12px',
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

const footerLinks = {
  color: '#8a8a8a',
  fontSize: '12px',
  margin: '0',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#c2410c',
  textDecoration: 'none',
}
