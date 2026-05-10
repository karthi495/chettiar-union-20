import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { MatchCard } from "./_authenticated/dashboard";
import { Filter, Loader2 } from "lucide-react";

type Profile = Tables<"profiles">;

export const Route = createFileRoute("/search")({ component: SearchPage });

function SearchPage() {
  const [filters, setFilters] = useState({ gender: "", community: "", sub_sect: "", q: "" });
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("profiles").select("*").limit(48);
    if (filters.gender) q = q.eq("gender", filters.gender as any);
    if (filters.community) q = q.ilike("community", `%${filters.community}%`);
    if (filters.sub_sect) q = q.ilike("sub_sect", `%${filters.sub_sect}%`);
    if (filters.q) q = q.ilike("full_name", `%${filters.q}%`);
    const { data } = await q;
    setResults(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl text-primary mb-6">Browse Matches</h1>
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="glass rounded-2xl p-5 shadow-elegant h-fit lg:sticky lg:top-20">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg text-primary">Filters</h3>
            </div>
            <div className="space-y-3">
              <div><Label>Looking for</Label>
                <Select value={filters.gender} onValueChange={(v) => setFilters({ ...filters, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Anyone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Bride</SelectItem>
                    <SelectItem value="male">Groom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Community</Label><Input value={filters.community} onChange={(e) => setFilters({ ...filters, community: e.target.value })} placeholder="Chettiar" /></div>
              <div><Label>Sub-sect</Label><Input value={filters.sub_sect} onChange={(e) => setFilters({ ...filters, sub_sect: e.target.value })} placeholder="Nattukottai…" /></div>
              <div><Label>Search by name</Label><Input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} /></div>
              <Button onClick={load} className="w-full bg-gradient-royal text-secondary">Apply Filters</Button>
            </div>
          </aside>

          <section>
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : results.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center text-muted-foreground">No profiles match your filters.</div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {results.map((p) => <MatchCard key={p.id} p={p} />)}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
