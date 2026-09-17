ALTER TABLE public.addon_groups
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS icon_name text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD CONSTRAINT addon_groups_media_type_check CHECK (media_type IN ('none', 'icon', 'image'));

ALTER TABLE public.addons
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS icon_name text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD CONSTRAINT addons_media_type_check CHECK (media_type IN ('none', 'icon', 'image'));

COMMENT ON COLUMN public.addon_groups.media_type IS 'Visual type: none, icon, or image';
COMMENT ON COLUMN public.addon_groups.icon_name IS 'Allowed Lucide icon name';
COMMENT ON COLUMN public.addon_groups.image_url IS 'Uploaded group image URL';
COMMENT ON COLUMN public.addons.media_type IS 'Visual type: none, icon, or image';
COMMENT ON COLUMN public.addons.icon_name IS 'Allowed Lucide icon name';
COMMENT ON COLUMN public.addons.image_url IS 'Uploaded add-on image URL';