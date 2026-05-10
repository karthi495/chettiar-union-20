import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import { Sparkles, Search, User as UserIcon } from "lucide-react";

type Profile = Tables<"profiles">;

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user } = useAuth();
  const [me, setMe] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Profile[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: mine } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      setMe(mine);
      const oppGender = mine?.gender === "male" ? "female" : mine?.gender === "female" ? "male" : null;
      const q = supabase.from("profiles").select("*").neq("user_id", user.id).limit(8);
      const { data } = oppGender ? await q.eq("gender", oppGender) : await q;
      setMatches(data || []);
    })();
  }, [user]);

  const completion = me?.profile_completion ?? 30;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl text-primary">
            Vanakkam, {me?.full_name?.split(" ")[0] || "Friend"} 🪔
          </h1>
          <p className="text-muted-foreground mt-1">Here are your latest matches and updates.</p>
        </motion.div>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 shadow-elegant">
            <h3 className="font-display text-lg text-primary mb-2">Profile Completion</h3>
            <div className="text-3xl font-display text-primary">{completion}%</div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-gold" style={{ width: `${completion}%` }} />
            </div>
            <Link to="/profile" className="mt-4 inline-block text-sm text-primary font-medium hover:underline">
              Complete profile →
            </Link>
          </div>
          <div className="glass rounded-2xl p-6 shadow-elegant">
            <Sparkles className="w-6 h-6 text-secondary mb-2" />
            <h3 className="font-display text-lg text-primary">Horoscope Match</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your jathagam details to see compatibility scores.</p>
            <Link to="/profile" className="mt-3 inline-block text-sm text-primary font-medium hover:underline">Add horoscope →</Link>
          </div>
          <div className="glass rounded-2xl p-6 shadow-elegant">
            <Search className="w-6 h-6 text-secondary mb-2" />
            <h3 className="font-display text-lg text-primary">Find Your Match</h3>
            <p className="text-sm text-muted-foreground mt-1">Search by community, age, education and more.</p>
            <Link to="/search" className="mt-3 inline-block text-sm text-primary font-medium hover:underline">Browse all →</Link>
          </div>
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between mb-5">
            <h2 className="font-display text-2xl text-primary">Suggested for you</h2>
            <Link to="/search" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {matches.length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground italic">No suggestions yet — invite friends to grow our community 🌸</div>
            )}
            {matches.map((m) => <MatchCard key={m.id} p={m} />)}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export function MatchCard({ p }: { p: Profile }) {
  const age = p.date_of_birth ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear() : null;
  return (
    <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl overflow-hidden shadow-elegant">
      <div className="aspect-[4/5] bg-gradient-royal flex items-center justify-center relative">
        {p.photo_url ? (
          <img src={p.photo_url} alt={p.full_name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <UserIcon className="w-20 h-20 text-secondary/60" />
        )}
        {p.is_online && <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/90 text-white text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-white" />Online</span>}
      </div>
      <div className="p-4">
        <div className="font-display text-lg text-primary">{p.full_name}{age ? `, ${age}` : ""}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{p.sub_sect || p.community}</div>
        <div className="text-xs mt-2 text-foreground/70 line-clamp-1">{p.education} • {p.occupation}</div>
      </div>
    </motion.div>
  );
}
