-- Add column to track if PWA install suggestion was shown
ALTER TABLE public.profiles ADD COLUMN pwa_install_suggested BOOLEAN DEFAULT FALSE;