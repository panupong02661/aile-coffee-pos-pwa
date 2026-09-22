CREATE TABLE public.line_channel_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('default','online_orders','pos_orders','daily_reports','monthly_reports')),
  channel_access_token TEXT,
  channel_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (shop_id, scope)
);

GRANT ALL ON public.line_channel_credentials TO service_role;

ALTER TABLE public.line_channel_credentials ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_line_channel_credentials_updated_at
BEFORE UPDATE ON public.line_channel_credentials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();