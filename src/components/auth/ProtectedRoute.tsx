import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export function ProtectedRoute({ children, requireSubscription = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isActive, isLoading: subscriptionLoading } = useSubscription();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking subscription (only if subscription is required)
  if (requireSubscription && subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect to pricing if subscription required but not active
  if (requireSubscription && !isActive) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}
