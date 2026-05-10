import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919999999999?text=Hi%20Chettiar%20Connect"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-elegant hover:scale-110 transition-transform animate-float"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" fill="currentColor" />
    </a>
  );
}
