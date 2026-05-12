import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Phone, MessageCircle, MapPin, Globe, Mail, Clock, Calendar, Users,
  HeartHandshake, Droplet, GraduationCap, UserPlus, ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";

export const Route = createFileRoute("/sangam/$slug")({
  component: SangamDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 py-20 text-center">
        <div>
          <h1 className="font-display text-5xl text-primary">Sangam not found</h1>
          <p className="text-muted-foreground mt-2">This Sangam isn't listed yet.</p>
          <Button asChild className="mt-6"><Link to="/sangam">Back to Directory</Link></Button>
        </div>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center px-6"><p className="text-destructive">{error.message}</p></div>
  ),
});

function SangamDetail() {
  const { slug } = Route.useParams();
  const { t, lang } = useI18n();

  const { data: s, isLoading, error } = useQuery({
    queryKey: ["sangam", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("sangams").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="h-72 rounded-2xl bg-muted/40 animate-pulse" />
        </div>
      </div>
    );
  }
  if (error || !s) return null;

  const name = pickLang(s.sangam_name_en, s.sangam_name_ta, lang);
  const altName = lang === "en" ? s.sangam_name_ta : s.sangam_name_en;
  const desc = pickLang(s.description_en, s.description_ta, lang);
  const addr = pickLang(s.address_en, s.address_ta, lang);
  const timing = pickLang(s.office_timing_en, s.office_timing_ta, lang);

  const events = (s.upcoming_events as { title?: string; date?: string; description?: string }[] | null) ?? [];

  const directionsUrl = s.map_link || (addr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}` : "");

  return (
    <div className="min-h-screen flex flex-col" lang={lang}>
      <Navbar />

      {/* Hero */}
      <section className="relative">
        <div className="h-64 md:h-80 overflow-hidden bg-gradient-royal">
          {s.image_url && (
            <img src={s.image_url} alt={name} className="w-full h-full object-cover opacity-70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
        </div>
        <div className="mx-auto max-w-6xl px-6 -mt-24 relative">
          <Link to="/sangam" className="inline-flex items-center gap-1 text-secondary text-sm mb-3 hover:opacity-80">
            <ArrowLeft className="w-4 h-4" /> {t("sangamDirectory")}
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 md:p-8 shadow-elegant"
          >
            {s.community_name && (
              <span className="text-[10px] uppercase tracking-widest bg-secondary/30 text-primary px-2 py-0.5 rounded-full">
                {s.community_name}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-5xl text-primary mt-2" lang={lang}>{name}</h1>
            {altName && <p className="font-display text-lg text-muted-foreground mt-1" lang={lang === "en" ? "ta" : "en"}>{altName}</p>}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {(s.city || s.district) && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" />{[s.city, s.district].filter(Boolean).join(", ")}</span>}
              {!!s.founded_year && <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" />{t("foundedIn")} {s.founded_year}</span>}
              {!!s.total_members && <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" />{s.total_members.toLocaleString()} {t("members")}</span>}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-2">
              {s.phone && <Button asChild className="bg-gradient-royal text-secondary"><a href={`tel:${s.phone}`}><Phone className="w-4 h-4 mr-1.5" />{t("callNow")}</a></Button>}
              {s.whatsapp && <Button asChild variant="outline" className="border-emerald-500/50 text-emerald-700"><a href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="w-4 h-4 mr-1.5" />{t("whatsapp")}</a></Button>}
              {directionsUrl && <Button asChild variant="outline"><a href={directionsUrl} target="_blank" rel="noreferrer"><MapPin className="w-4 h-4 mr-1.5" />{t("getDirections")}</a></Button>}
              {s.website && <Button asChild variant="outline"><a href={s.website} target="_blank" rel="noreferrer"><Globe className="w-4 h-4 mr-1.5" />{t("visitWebsite")}</a></Button>}
              <Button asChild variant="outline"><Link to="/register"><UserPlus className="w-4 h-4 mr-1.5" />{t("registerMember")}</Link></Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10 grid lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard n={s.registered_families ?? 0} l={t("families")} />
            <StatCard n={s.total_members ?? 0} l={t("members")} />
            <StatCard n={s.marriage_success_count ?? 0} l={t("marriages")} />
            <StatCard n={s.active_events ?? 0} l={t("activeEvents")} />
          </div>

          {desc && (
            <Section title={t("about")}>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line" lang={lang}>{desc}</p>
            </Section>
          )}

          {/* Services */}
          {(s.blood_donation_info || s.marriage_help_info || s.educational_support_info) && (
            <Section title={t("services")}>
              <div className="grid md:grid-cols-3 gap-4">
                {s.blood_donation_info && <ServiceCard icon={Droplet} title={t("bloodDonation")} text={s.blood_donation_info} />}
                {s.marriage_help_info && <ServiceCard icon={HeartHandshake} title={t("marriageHelp")} text={s.marriage_help_info} />}
                {s.educational_support_info && <ServiceCard icon={GraduationCap} title={t("educationalSupport")} text={s.educational_support_info} />}
              </div>
            </Section>
          )}

          {/* Events */}
          {events.length > 0 && (
            <Section title={t("upcomingEvents")}>
              <ul className="space-y-3">
                {events.map((e, i) => (
                  <li key={i} className="rounded-xl border border-border/60 p-4 bg-card/60">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display text-lg text-primary">{e.title}</div>
                        {e.description && <p className="text-sm text-muted-foreground mt-1">{e.description}</p>}
                      </div>
                      {e.date && <span className="text-xs text-muted-foreground whitespace-nowrap">{e.date}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Gallery */}
          {s.gallery_urls && s.gallery_urls.length > 0 && (
            <Section title={t("gallery")}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {s.gallery_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden bg-muted">
                    <img src={url} alt={`${name} ${i + 1}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Section title={t("contact")}>
            <ul className="text-sm space-y-3">
              {s.contact_person && <li><div className="text-xs text-muted-foreground uppercase">Contact</div><div>{s.contact_person}</div></li>}
              {s.phone && <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /><a href={`tel:${s.phone}`} className="hover:underline">{s.phone}</a></li>}
              {s.whatsapp && <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-emerald-600" /><a href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:underline">{s.whatsapp}</a></li>}
              {s.email && <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /><a href={`mailto:${s.email}`} className="hover:underline break-all">{s.email}</a></li>}
              {s.website && <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /><a href={s.website} target="_blank" rel="noreferrer" className="hover:underline break-all">{s.website}</a></li>}
            </ul>
          </Section>

          {addr && (
            <Section title={t("address")}>
              <p className="text-sm whitespace-pre-line" lang={lang}>{addr}</p>
            </Section>
          )}

          {timing && (
            <Section title={t("officeHours")}>
              <p className="text-sm inline-flex items-start gap-2" lang={lang}><Clock className="w-4 h-4 mt-0.5 text-primary" />{timing}</p>
            </Section>
          )}

          {s.map_link && (
            <a href={s.map_link} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden glass shadow-elegant">
              <div className="bg-gradient-gold/40 aspect-video flex items-center justify-center text-primary">
                <MapPin className="w-8 h-8" />
              </div>
              <div className="p-3 text-sm font-medium text-center">{t("getDirections")}</div>
            </a>
          )}
        </aside>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-6 shadow-elegant">
      <h2 className="font-display text-2xl text-primary mb-4">{title}</h2>
      {children}
    </section>
  );
}

function StatCard({ n, l }: { n: number; l: string }) {
  return (
    <div className="glass rounded-xl p-4 text-center shadow-elegant">
      <div className="font-display text-2xl text-primary">{n.toLocaleString()}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{l}</div>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-4 bg-card/60">
      <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center mb-2"><Icon className="w-5 h-5 text-primary" /></div>
      <div className="font-display text-primary">{title}</div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{text}</p>
    </div>
  );
}
