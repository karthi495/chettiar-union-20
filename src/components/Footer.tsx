import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-gradient-royal text-secondary">
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5" fill="currentColor" />
            <span className="font-display text-xl">Chettiar Connect</span>
          </div>
          <p className="text-sm opacity-80 max-w-xs">
            Honouring tradition, celebrating union. The trusted matrimony for the Chettiar community.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-secondary/90">Explore</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/search">Browse Profiles</Link></li>
            <li><Link to="/register">Create Profile</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-secondary/90">Community</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>Nattukottai Chettiar</li>
            <li>Devanga Chettiar</li>
            <li>Vaniya Chettiar</li>
            <li>Beri Chettiar</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-secondary/90">Contact</h4>
          <p className="text-sm opacity-80 mb-3">support@chettiarconnect.app</p>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/15 hover:bg-secondary/25 text-sm transition"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp Us
          </a>
        </div>
      </div>
      <div className="border-t border-secondary/15 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Chettiar Connect. Made with reverence for tradition.
      </div>
    </footer>
  );
}
