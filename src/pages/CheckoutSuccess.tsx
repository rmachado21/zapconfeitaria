import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { checkSubscription, isLoading } = useSubscription();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifySubscription = async () => {
      // Wait a moment for Stripe webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await checkSubscription();
      setVerifying(false);
    };

    verifySubscription();
  }, [checkSubscription]);

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          {verifying || isLoading ? (
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
          ) : (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          )}
          <CardTitle className="text-2xl">
            {verifying ? 'Processando...' : 'Assinatura ativada!'}
          </CardTitle>
          <CardDescription className="text-base">
            {verifying 
              ? 'Estamos confirmando seu pagamento...'
              : 'Obrigado por assinar o ZAP Confeitaria. Seu acesso já está liberado!'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!verifying && (
            <>
              <p className="text-sm text-muted-foreground">
                Você receberá um email de confirmação com os detalhes da sua assinatura.
              </p>
              <Button onClick={handleContinue} className="w-full" size="lg">
                Começar a usar
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
