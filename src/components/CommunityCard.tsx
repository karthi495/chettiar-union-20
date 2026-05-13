import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type Entry = Tables<"community_directory">;

export function CommunityCard({ e, index = 0 }: { e: Entry; index?: number }) {
  const cover = e.image_urls?.[0];
  const wa = (e.whatsapp || e.phone || "").replace(/\D/g, "");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="group glass rounded-2xl overflow-hidden shadow-elegant hover:shadow-gold transition-all hover:-translate-y-1 flex flex-col"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {cover ? (
          <img src={cover} alt={e.family_name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-royal flex items-center justify-center text-secondary font-display text-4xl">
            {e.family_name.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        {e.community_type && (
          <div className="text-[10px] uppercase tracking-widest text-secondary-foreground bg-secondary/30 inline-block px-2 py-0.5 rounded-full mb-2 self-start">
            {e.community_type}
          </div>
        )}
        <h3 className="font-display text-xl text-primary leading-snug">{e.family_name}</h3>
        <p className="text-sm text-muted-foreground">{e.full_name}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {(e.city || e.district) && (
            <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{[e.city, e.district].filter(Boolean).join(", ")}</span>
          )}
          {e.phone && (
            <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{e.phone}</span>
          )}
        </div>
        <div className="mt-auto pt-4 flex gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/community/$id" params={{ id: e.id }}>View</Link>
          </Button>
          {wa && (
            <Button asChild size="sm" className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white">
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
