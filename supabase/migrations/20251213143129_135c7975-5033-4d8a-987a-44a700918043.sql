-- Update subscription status for user rmachado21@gmail.com
UPDATE public.subscriptions 
SET status = 'active', 
    plan_type = 'yearly',
    stripe_subscription_id = 'sub_1Sdtl3RoeoTQI3R3tbw8Tlct',
    current_period_start = '2025-12-13T14:25:18Z',
    current_period_end = '2026-12-13T14:25:18Z',
    cancel_at_period_end = false,
    updated_at = now()
WHERE user_id = '854d170f-d9cc-4c77-bd12-2dc21024d0f7';