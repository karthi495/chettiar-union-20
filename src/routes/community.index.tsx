import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CommunityCard } from "@/components/CommunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/community/")({ component: CommunityIndex });

const FUNCTION_TYPES = ["Wedding", "Ear Piercing", "House Warming", "Temple Function", "Business", "Others"];

function CommunityIndex() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("");
  const [fnType, setFnType] = useState("");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["community-directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_directory")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const districts = useMemo(
    () => Array.from(new Set(entries.map((e) => e.district).filter(Boolean))) as string[],
    [entries],
  );

  const filtered = entries.filter((e) => {
    if (district && e.district !== district) return false;
    if (fnType && e.function_type !== fnType) return false;
    if (q) {
      const s = q.toLowerCase();
      const hay = [e.family_name, e.full_name, e.city, e.district, e.community_type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="bg-gradient-royal text-secondary py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-4xl md:text-5xl">{t("communityDirectory")}</h1>
          <p className="opacity-90 mt-2 max-w-2xl">{t("communityDirectoryTagline")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-secondary text-primary hover:bg-secondary/90">
              <Link to="/community/register"><Plus className="w-4 h-4 mr-1.5" />{t("registerFamily")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl w-full px-6 py-8">
        <div className="glass rounded-2xl p-4 shadow-elegant grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholderCommunity")} className="pl-9" />
          </div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background">
            <option value="">{t("allDistricts")}</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={fnType} onChange={(e) => setFnType(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background">
            <option value="">{t("allFunctionTypes")}</option>
            {FUNCTION_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </section>

      <section className="mx-auto max-w-7xl w-full px-6 pb-16 flex-1">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">{t("noResults")}</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((e, i) => <CommunityCard key={e.id} e={e} index={i} />)}
          </div>
        )}
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
