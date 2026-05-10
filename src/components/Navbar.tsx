import { Link, useRouter } from "@tanstack/react-router";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Browse" },
    user ? { to: "/dashboard", label: "Dashboard" } : null,
    user ? { to: "/profile", label: "My Profile" } : null,
  ].filter(Boolean) as { to: string; label: string }[];

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-royal flex items-center justify-center shadow-elegant">
            <Heart className="w-5 h-5 text-secondary" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold text-primary">Chettiar Connect</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Premium Matrimony</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                router.navigate({ to: "/" });
              }}
            >
              Sign out
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Login</Link></Button>
              <Button asChild size="sm" className="bg-gradient-royal text-secondary border border-secondary/30 shadow-elegant hover:opacity-95">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur">
          <div className="px-4 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm py-2" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <Button variant="outline" size="sm" onClick={async () => { await signOut(); setOpen(false); router.navigate({ to: "/" }); }}>Sign out</Button>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/login" onClick={() => setOpen(false)}>Login</Link></Button>
                <Button asChild size="sm" className="flex-1 bg-gradient-royal text-secondary"><Link to="/register" onClick={() => setOpen(false)}>Register</Link></Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
