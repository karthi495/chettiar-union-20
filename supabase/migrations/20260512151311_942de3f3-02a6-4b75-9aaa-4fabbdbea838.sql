
-- User roles for admin
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sangams table
CREATE TABLE public.sangams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  sangam_name_en TEXT NOT NULL,
  sangam_name_ta TEXT,
  community_name TEXT,
  district TEXT,
  city TEXT,
  address_en TEXT,
  address_ta TEXT,
  contact_person TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  office_timing_en TEXT,
  office_timing_ta TEXT,
  founded_year INTEGER,
  total_members INTEGER DEFAULT 0,
  registered_families INTEGER DEFAULT 0,
  marriage_success_count INTEGER DEFAULT 0,
  active_events INTEGER DEFAULT 0,
  description_en TEXT,
  description_ta TEXT,
  map_link TEXT,
  image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  upcoming_events JSONB DEFAULT '[]'::jsonb,
  blood_donation_info TEXT,
  marriage_help_info TEXT,
  educational_support_info TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sangams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view approved sangams" ON public.sangams FOR SELECT USING (is_approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert sangams" ON public.sangams FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update sangams" ON public.sangams FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete sangams" ON public.sangams FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_sangams_updated_at BEFORE UPDATE ON public.sangams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_sangams_district ON public.sangams(district);
CREATE INDEX idx_sangams_city ON public.sangams(city);
CREATE INDEX idx_sangams_community ON public.sangams(community_name);
CREATE INDEX idx_sangams_featured ON public.sangams(is_featured) WHERE is_featured = true;

-- Storage bucket for sangam gallery
INSERT INTO storage.buckets (id, name, public) VALUES ('sangam-gallery', 'sangam-gallery', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public read sangam gallery" ON storage.objects FOR SELECT USING (bucket_id = 'sangam-gallery');
CREATE POLICY "Admins upload sangam gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sangam-gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update sangam gallery" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'sangam-gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete sangam gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'sangam-gallery' AND public.has_role(auth.uid(), 'admin'));
