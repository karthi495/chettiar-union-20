import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Users, Calendar } from "lucide-react";
import { useI18n, pickLang } from "@/lib/i18n";
import type { Tables } from "@/integrations/supabase/types";

type Sangam = Tables<"sangams">;

export function SangamCard({ s, index = 0 }: { s: Sangam; index?: number }) {
  const { lang, t } = useI18n();
  const name = pickLang(s.sangam_name_en, s.sangam_name_ta, lang);
  const desc = pickLang(s.description_en, s.description_ta, lang);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group glass rounded-2xl overflow-hidden shadow-elegant hover:shadow-gold transition-all hover:-translate-y-1"
    >
      <Link to="/sangam/$slug" params={{ slug: s.slug }} className="block">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {s.image_url ? (
            <img
              src={s.image_url}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-royal flex items-center justify-center text-secondary font-display text-3xl">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div className="p-5">
          {s.community_name && (
            <div className="text-[10px] uppercase tracking-widest text-secondary-foreground bg-secondary/30 inline-block px-2 py-0.5 rounded-full mb-2">
              {s.community_name}
            </div>
          )}
          <h3 className="font-display text-xl text-primary leading-snug" lang={lang}>{name}</h3>
          {desc && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2" lang={lang}>{desc}</p>}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {(s.city || s.district) && (
              <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{[s.city, s.district].filter(Boolean).join(", ")}</span>
            )}
            {!!s.total_members && (
              <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{s.total_members.toLocaleString()} {t("members")}</span>
            )}
            {!!s.founded_year && (
              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{s.founded_year}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
