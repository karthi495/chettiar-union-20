import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OtpModal } from "@/components/OtpModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({ component: Register });

const schema = z.object({
  full_name: z.string().trim().min(2, "Name required").max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]),
  date_of_birth: z.string().min(1, "Required"),
  community: z.string().min(1, "Required"),
  sub_sect: z.string().optional(),
  education: z.string().min(1, "Required"),
  occupation: z.string().min(1, "Required"),
  horoscope: z.string().optional(),
});

const SUB_SECTS = ["Nattukottai Chettiar", "Devanga Chettiar", "Vaniya Chettiar", "Beri Chettiar", "Saiva Pillai Chettiar", "Other"];

function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", gender: "" as "male" | "female" | "other" | "",
    date_of_birth: "", community: "Chettiar", sub_sect: "", education: "", occupation: "", horoscope: "",
  });
  const [showOtp, setShowOtp] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0]?.message || "Please complete all required fields");
    }
    setShowOtp(true);
  };

  const onVerified = async () => {
    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user.id;
    if (!userId) return toast.error("Session not found");

    // Create profile (upsert protects against duplicates)
    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone || null,
        gender: form.gender as "male" | "female" | "other",
        date_of_birth: form.date_of_birth,
        community: form.community,
        sub_sect: form.sub_sect || null,
        education: form.education,
        occupation: form.occupation,
        horoscope: form.horoscope || null,
        profile_completion: 60,
      },
      { onConflict: "user_id" },
    );
    if (error) return toast.error(error.message);
    toast.success("Profile created!");
    router.navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl glass rounded-2xl p-8 md:p-10 shadow-elegant"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-primary">Create Your Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Begin your journey to find your perfect match</p>
          </div>

          <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
            <Field label="Full Name *"><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required /></Field>
            <Field label="Email *"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Gender *">
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Date of Birth *"><Input type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} required /></Field>
            <Field label="Community *"><Input value={form.community} onChange={(e) => set("community", e.target.value)} required /></Field>
            <Field label="Sub-sect">
              <Select value={form.sub_sect} onValueChange={(v) => set("sub_sect", v)}>
                <SelectTrigger><SelectValue placeholder="Select sub-sect" /></SelectTrigger>
                <SelectContent>
                  {SUB_SECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Education *"><Input placeholder="B.Tech, MBA…" value={form.education} onChange={(e) => set("education", e.target.value)} required /></Field>
            <Field label="Occupation *" full><Input placeholder="Software Engineer, Doctor…" value={form.occupation} onChange={(e) => set("occupation", e.target.value)} required /></Field>
            <Field label="Horoscope (Rasi/Nakshatram)" full>
              <Textarea rows={3} placeholder="e.g. Rasi: Mesham, Nakshatram: Ashwini, Padham: 2" value={form.horoscope} onChange={(e) => set("horoscope", e.target.value)} />
            </Field>

            <div className="md:col-span-2 mt-2">
              <Button type="submit" className="w-full bg-gradient-royal text-secondary border border-secondary/30 shadow-elegant" size="lg">
                Continue → Verify Email
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                We'll send a 6-digit OTP to your email. By continuing you agree to our terms.
              </p>
            </div>
          </form>
        </motion.div>
      </main>
      <Footer />

      <OtpModal
        open={showOtp}
        email={form.email.trim().toLowerCase()}
        onClose={() => setShowOtp(false)}
        onVerified={onVerified}
      />
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
