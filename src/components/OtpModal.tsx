import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { sendOtp, verifyOtp } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  email: string;
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export function OtpModal({ email, open, onClose, onVerified }: Props) {
  const send = useServerFn(sendOtp);
  const verify = useServerFn(verifyOtp);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    setCode(["", "", "", "", "", ""]);
    setResendIn(30);
    (async () => {
      try {
        await send({ data: { email } });
        toast.success(`Code sent to ${email}`);
      } catch (e: any) {
        toast.error(e.message || "Failed to send code");
      }
    })();
  }, [open, email, send]);

  useEffect(() => {
    if (!open || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn, open]);

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setCode(text.split(""));
      e.preventDefault();
      refs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const full = code.join("");
    if (full.length !== 6) return toast.error("Enter all 6 digits");
    setLoading(true);
    try {
      const { tokenHash } = await verify({ data: { email, code: full } });
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "magiclink",
      });
      if (error) throw error;
      toast.success("Verified! Welcome.");
      onVerified();
    } catch (e: any) {
      toast.error(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await send({ data: { email } });
      toast.success("New code sent");
      setResendIn(30);
    } catch (e: any) {
      toast.error(e.message || "Failed to resend");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass relative w-full max-w-md rounded-2xl p-8 shadow-elegant"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center mb-3 shadow-gold">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-2xl text-primary">Verify your email</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We sent a 6-digit code to <span className="font-medium">{email}</span>
              </p>
            </div>

            <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el; }}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus();
                  }}
                  className="w-12 h-14 text-center text-xl font-semibold rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading || code.join("").length !== 6}
              className="w-full bg-gradient-royal text-secondary border border-secondary/30 shadow-elegant"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              {resendIn > 0 ? (
                <>Resend code in {resendIn}s</>
              ) : (
                <button onClick={handleResend} className="text-primary font-medium hover:underline">
                  Resend code
                </button>
              )}
            </div>
            <p className="text-[11px] text-center text-muted-foreground mt-3">Code expires in 5 minutes.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
