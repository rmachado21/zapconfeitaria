import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No stripe-signature header");
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep("Event verified", { type: event.type, id: event.id });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logStep("ERROR: Signature verification failed", { error: errorMsg });
      return new Response(`Webhook signature verification failed: ${errorMsg}`, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });
        
        if (session.mode === "subscription" && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customerEmail = session.customer_email || session.customer_details?.email;
          
          if (customerEmail) {
            // Find user by email
            const { data: authUsers } = await supabase.auth.admin.listUsers();
            const user = authUsers?.users?.find(u => u.email === customerEmail);
            
            if (user) {
              const interval = subscription.items.data[0]?.price?.recurring?.interval;
              const planType = interval === 'year' ? 'yearly' : 'monthly';
              
              await supabase.from('subscriptions').upsert({
                user_id: user.id,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
                status: 'active',
                plan_type: planType,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });
              
              logStep("Subscription created/updated", { userId: user.id, planType });
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });
        
        // Find subscription in database
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();
        
        if (existingSub) {
          const interval = subscription.items.data[0]?.price?.recurring?.interval;
          const planType = interval === 'year' ? 'yearly' : 'monthly';
          
          await supabase.from('subscriptions').update({
            status: subscription.status === 'active' ? 'active' : subscription.status,
            plan_type: planType,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }).eq('id', existingSub.id);
          
          logStep("Subscription record updated", { userId: existingSub.user_id });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription canceled", { subscriptionId: subscription.id });
        
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();
        
        if (existingSub) {
          await supabase.from('subscriptions').update({
            status: 'canceled',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          }).eq('id', existingSub.id);
          
          logStep("Subscription marked as canceled", { userId: existingSub.user_id });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", { invoiceId: invoice.id, subscriptionId: invoice.subscription });
        
        if (invoice.subscription) {
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .maybeSingle();
          
          if (existingSub) {
            // Refresh subscription data from Stripe
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            
            await supabase.from('subscriptions').update({
              status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            }).eq('id', existingSub.id);
            
            logStep("Subscription renewed", { userId: existingSub.user_id });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment failed", { invoiceId: invoice.id, subscriptionId: invoice.subscription });
        
        if (invoice.subscription) {
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .maybeSingle();
          
          if (existingSub) {
            await supabase.from('subscriptions').update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            }).eq('id', existingSub.id);
            
            logStep("Subscription marked as past_due", { userId: existingSub.user_id });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
