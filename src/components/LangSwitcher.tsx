import { useI18n, type Lang } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 p-0.5 text-xs ${className}`}>
      <Globe className="w-3.5 h-3.5 mx-1.5 text-muted-foreground" />
      {(["en", "ta"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            lang === l ? "bg-gradient-royal text-secondary" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          {l === "en" ? "EN" : "தமிழ்"}
        </button>
      ))}
    </div>
  );
}
