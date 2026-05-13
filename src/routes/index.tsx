import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CommunityCard } from "@/components/CommunityCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t } = useI18n();
  const { data: recent = [] } = useQuery({
    queryKey: ["community-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("community_directory")
        .select("*")
        .eq("is_approved", true)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Tamil bride and groom" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-36 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-secondary"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-xs uppercase tracking-widest mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Trusted by 50,000+ families
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-tight mb-5">
              Where <span className="text-gradient-gold">tradition</span> meets your
              <br /> destined match.
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-xl mb-8">
              The premium matrimony platform exclusively for the Chettiar community.
              Verified profiles, horoscope matching, and the warmth of Tamil tradition.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-secondary text-primary font-semibold hover:bg-secondary/90 shadow-gold">
                <Link to="/register">Create Free Profile</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-secondary/60 text-secondary hover:bg-secondary/10">
                <Link to="/community">{t("communityDirectory")}</Link>
              </Button>
            </div>
            <div className="mt-10 flex gap-8 text-sm">
              <Stat n="50K+" l="Members" />
              <Stat n="12K+" l="Marriages" />
              <Stat n="100%" l="Verified" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-3 gap-6">
        {[
          { icon: ShieldCheck, t: "Verified Profiles", d: "Every profile is verified by phone and email — no fake accounts." },
          { icon: Heart, t: "Horoscope Matching", d: "Traditional jathagam compatibility built-in for every match." },
          { icon: Users, t: "Community First", d: "Filter by sub-sect, gothram, and family roots." },
        ].map((f, i) => (
          <motion.div
            key={f.t}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-7 shadow-elegant"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mb-4 shadow-gold">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-xl text-primary mb-2">{f.t}</h3>
            <p className="text-sm text-muted-foreground">{f.d}</p>
          </motion.div>
        ))}
      </section>

      {/* Community Directory recent */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-4xl text-primary">{t("recentRegistrations")}</h2>
              <p className="text-muted-foreground mt-2">{t("communityDirectoryTagline")}</p>
            </div>
            <Link to="/community" className="text-sm text-primary font-semibold hover:underline">{t("viewAll")} →</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((e, i) => <CommunityCard key={e.id} e={e} index={i} />)}
          </div>
        </section>
      )}

      {/* Success stories */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl text-primary">Stories of Sacred Union</h2>
          <p className="text-muted-foreground mt-2">Couples who found each other through Chettiar Connect</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "Aishwarya & Karthik", q: "We met through Chettiar Connect and our families instantly clicked. Married within 6 months." },
            { n: "Priya & Senthil", q: "Horoscope match was perfect. Our parents were so happy with the verified profiles." },
            { n: "Divya & Arun", q: "The community filters helped us find someone with the same values. Beautiful experience." },
          ].map((s) => (
            <div key={s.n} className="glass rounded-2xl p-6 shadow-elegant">
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 text-secondary" fill="currentColor" />)}</div>
              <p className="text-sm italic text-foreground/80 mb-4">"{s.q}"</p>
              <div className="font-display text-primary">{s.n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="bg-gradient-royal rounded-3xl p-10 md:p-14 text-center text-secondary shadow-elegant">
          <h2 className="font-display text-4xl md:text-5xl mb-3">Begin your journey today</h2>
          <p className="opacity-90 mb-7 max-w-xl mx-auto">Create your profile in minutes. Verified by email OTP — your privacy is sacred to us.</p>
          <Button asChild size="lg" className="bg-secondary text-primary font-semibold hover:bg-secondary/90 shadow-gold">
            <Link to="/register">Get Started — It's Free</Link>
          </Button>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-secondary">{n}</div>
      <div className="text-xs uppercase tracking-widest opacity-75">{l}</div>
    </div>
  );
}
