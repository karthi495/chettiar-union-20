import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OtpModal } from "@/components/OtpModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const search = z.object({ redirect: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/login")({
  validateSearch: search,
  component: Login,
});

function Login() {
  const router = useRouter();
  const { redirect } = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().email().safeParse(email.trim().toLowerCase());
    if (!parsed.success) return toast.error("Enter a valid email");
    setShowOtp(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass rounded-2xl p-8 shadow-elegant"
        >
          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-gradient-royal flex items-center justify-center mb-3 shadow-elegant">
              <Mail className="w-6 h-6 text-secondary" />
            </div>
            <h1 className="font-display text-3xl text-primary">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in with email — we'll send you a code</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-royal text-secondary border border-secondary/30 shadow-elegant">
              Send OTP
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-5">
            New here?{" "}
            <a href="/register" className="text-primary font-medium hover:underline">Create a profile</a>
          </p>
        </motion.div>
      </main>
      <Footer />

      <OtpModal
        open={showOtp}
        email={email.trim().toLowerCase()}
        onClose={() => setShowOtp(false)}
        onVerified={() => router.navigate({ to: redirect || "/dashboard" })}
      />
    </div>
  );
}
