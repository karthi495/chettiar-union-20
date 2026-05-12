import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SangamCard } from "@/components/SangamCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/sangam/")({
  head: () => ({
    meta: [
      { title: "Chettiar Sangams Directory — Find a Sangam Near You" },
      { name: "description", content: "Browse Chettiar Sangams across Tamil Nadu. Find contact details, services, and events from your community Sangam." },
      { property: "og:title", content: "Chettiar Sangams Directory" },
      { property: "og:description", content: "Browse Chettiar Sangams across Tamil Nadu — bilingual English & Tamil." },
    ],
  }),
  component: SangamList,
});

function SangamList() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState<string>("all");
  const [community, setCommunity] = useState<string>("all");

  const { data: sangams = [], isLoading } = useQuery({
    queryKey: ["sangams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sangams")
        .select("*")
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const districts = useMemo(
    () => Array.from(new Set(sangams.map((s) => s.district).filter(Boolean))) as string[],
    [sangams]
  );
  const communities = useMemo(
    () => Array.from(new Set(sangams.map((s) => s.community_name).filter(Boolean))) as string[],
    [sangams]
  );

  const filtered = sangams.filter((s) => {
    const text = `${s.sangam_name_en} ${s.sangam_name_ta ?? ""} ${s.city ?? ""} ${s.district ?? ""}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (district !== "all" && s.district !== district) return false;
    if (community !== "all" && s.community_name !== community) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col" lang={lang}>
      <Navbar />

      <section className="bg-gradient-royal text-secondary py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl">{t("sangamDirectory")}</h1>
          <p className="mt-2 opacity-90">{t("findSangam")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl w-full px-6 -mt-8">
        <div className="glass rounded-2xl p-4 md:p-5 shadow-elegant grid md:grid-cols-[1fr_200px_200px] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-9 bg-card/80"
            />
          </div>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="bg-card/80"><SelectValue placeholder={t("allDistricts")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allDistricts")}</SelectItem>
              {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={community} onValueChange={setCommunity}>
            <SelectTrigger className="bg-card/80"><SelectValue placeholder={t("allCommunities")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCommunities")}</SelectItem>
              {communities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mx-auto max-w-7xl w-full px-6 py-10 flex-1">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[16/12] rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">{t("noResults")}</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s, i) => <SangamCard key={s.id} s={s} index={i} />)}
          </div>
        )}
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
