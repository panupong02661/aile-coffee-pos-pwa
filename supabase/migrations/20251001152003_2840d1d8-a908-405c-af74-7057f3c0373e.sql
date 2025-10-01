-- Create a deduplication outbox for notifications
CREATE TABLE IF NOT EXISTS public.notification_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (edge functions use service role and bypass RLS)
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read (optional for debugging/monitoring)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_outbox' AND policyname = 'Authenticated can read notification_outbox'
  ) THEN
    CREATE POLICY "Authenticated can read notification_outbox"
    ON public.notification_outbox
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Helpful index (unique already creates index, but keep naming explicit)
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_outbox_event_key ON public.notification_outbox(event_key);
