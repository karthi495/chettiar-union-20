DROP TABLE IF EXISTS public.sangams CASCADE;

CREATE TABLE public.community_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  full_name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  community_type TEXT,
  gothram TEXT,
  district TEXT,
  city TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  profession TEXT,
  function_type TEXT,
  description TEXT,
  image_urls TEXT[] DEFAULT '{}'::text[],
  visibility TEXT NOT NULL DEFAULT 'public',
  hide_address BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_directory_district ON public.community_directory(district);
CREATE INDEX idx_community_directory_function_type ON public.community_directory(function_type);
CREATE INDEX idx_community_directory_approved ON public.community_directory(is_approved);

ALTER TABLE public.community_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved public listings"
  ON public.community_directory FOR SELECT
  TO anon, authenticated
  USING (is_approved = true AND visibility = 'public');

CREATE POLICY "Authenticated can view approved community listings"
  ON public.community_directory FOR SELECT
  TO authenticated
  USING (is_approved = true AND visibility IN ('public', 'community'));

CREATE POLICY "Owners view own listing"
  ON public.community_directory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all listings"
  ON public.community_directory FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated insert own listing"
  ON public.community_directory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner updates own listing"
  ON public.community_directory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins update all listings"
  ON public.community_directory FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owner deletes own listing"
  ON public.community_directory FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins delete listings"
  ON public.community_directory FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_community_directory_updated_at
  BEFORE UPDATE ON public.community_directory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('community-photos', 'community-photos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read community photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-photos');

CREATE POLICY "Authenticated upload own community photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'community-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner updates own community photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'community-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner deletes own community photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'community-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
