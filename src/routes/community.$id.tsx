import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Mail, Briefcase, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/community/$id")({ component: CommunityDetail });

function CommunityDetail() {
  const { id } = Route.useParams();
  const { data: e, isLoading } = useQuery({
    queryKey: ["community-directory", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("community_directory").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!e) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div className="glass p-10 rounded-2xl shadow-elegant max-w-md">
            <h1 className="font-display text-2xl text-primary">Listing not found</h1>
            <Button asChild className="mt-4"><Link to="/community">Back to directory</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const wa = (e.whatsapp || e.phone || "").replace(/\D/g, "");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-5xl w-full px-6 py-10 flex-1">
        <Link to="/community" className="inline-flex items-center gap-1 text-sm text-primary mb-6 hover:underline"><ArrowLeft className="w-4 h-4" />Directory</Link>

        <div className="glass rounded-3xl shadow-elegant overflow-hidden">
          {e.image_urls?.[0] && (
            <div className="aspect-[21/9] overflow-hidden bg-muted">
              <img src={e.image_urls[0]} alt={e.family_name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {e.community_type && (
                  <div className="text-[10px] uppercase tracking-widest text-secondary-foreground bg-secondary/30 inline-block px-2 py-0.5 rounded-full mb-2">
                    {e.community_type}
                  </div>
                )}
                <h1 className="font-display text-4xl text-primary">{e.family_name}</h1>
                <p className="text-muted-foreground mt-1">{e.full_name}{e.gothram && ` · Gothram: ${e.gothram}`}</p>
              </div>
              <div className="flex gap-2">
                {e.phone && (
                  <Button asChild variant="outline"><a href={`tel:${e.phone}`}><Phone className="w-4 h-4 mr-1" />Call</a></Button>
                )}
                {wa && (
                  <Button asChild className="bg-[#25D366] hover:bg-[#1da851] text-white">
                    <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a>
                  </Button>
                )}
              </div>
            </div>

            {e.description && <p className="mt-6 text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{e.description}</p>}

            <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm">
              {(e.city || e.district) && (
                <Info icon={MapPin} label="Location">{[e.city, e.district].filter(Boolean).join(", ")}</Info>
              )}
              {e.address && !e.hide_address && (
                <Info icon={MapPin} label="Address">{e.address}</Info>
              )}
              {e.profession && <Info icon={Briefcase} label="Profession">{e.profession}</Info>}
              {e.function_type && <Info icon={Briefcase} label="Function Type">{e.function_type}</Info>}
              {e.phone && <Info icon={Phone} label="Phone">{e.phone}</Info>}
              {e.whatsapp && <Info icon={Phone} label="WhatsApp">{e.whatsapp}</Info>}
              {e.email && <Info icon={Mail} label="Email">{e.email}</Info>}
            </div>

            {e.image_urls && e.image_urls.length > 1 && (
              <div className="mt-8">
                <h3 className="font-display text-xl text-primary mb-3">Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {e.image_urls.slice(1).map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded-xl bg-muted">
                      <img src={u} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {e.address && !e.hide_address && (
              <div className="mt-8">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Open in Google Maps →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Info({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="w-4 h-4 mt-0.5 text-primary" />
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}
