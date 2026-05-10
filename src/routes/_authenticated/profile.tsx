import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { Camera, Loader2, User as UserIcon } from "lucide-react";

type Profile = Tables<"profiles">;

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user } = useAuth();
  const [p, setP] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      setP(data || { user_id: user.id, email: user.email });
      setLoading(false);
    });
  }, [user]);

  const set = <K extends keyof Profile>(k: K, v: Profile[K] | string | null) =>
    setP((prev) => ({ ...prev, [k]: v as Profile[K] }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const completion = computeCompletion(p);
    const { error } = await supabase.from("profiles").upsert(
      { ...p, user_id: user.id, email: p.email || user.email!, full_name: p.full_name || "Member", profile_completion: completion } as any,
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    setP((prev) => ({ ...prev, profile_completion: completion }));
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data: pub } = supabase.storage.from("profile-photos").getPublicUrl(path);
    set("photo_url", pub.publicUrl);
    await supabase.from("profiles").update({ photo_url: pub.publicUrl }).eq("user_id", user.id);
    setUploading(false);
    toast.success("Photo updated");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl text-primary mb-6">My Biodata</h1>

        <div className="glass rounded-2xl p-6 shadow-elegant mb-6 flex items-center gap-5">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-royal flex items-center justify-center shadow-elegant">
            {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-secondary/70" />}
          </div>
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-gold text-primary font-medium cursor-pointer shadow-gold">
              <Camera className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
            </label>
            <p className="text-xs text-muted-foreground mt-2">JPG/PNG, up to 5MB</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-elegant grid md:grid-cols-2 gap-4">
          <Field label="Full Name"><Input value={p.full_name || ""} onChange={(e) => set("full_name", e.target.value)} /></Field>
          <Field label="Phone"><Input value={p.phone || ""} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Gender">
            <Select value={p.gender || ""} onValueChange={(v) => set("gender", v as any)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date of Birth"><Input type="date" value={p.date_of_birth || ""} onChange={(e) => set("date_of_birth", e.target.value)} /></Field>
          <Field label="Community"><Input value={p.community || ""} onChange={(e) => set("community", e.target.value)} /></Field>
          <Field label="Sub-sect"><Input value={p.sub_sect || ""} onChange={(e) => set("sub_sect", e.target.value)} /></Field>
          <Field label="Education"><Input value={p.education || ""} onChange={(e) => set("education", e.target.value)} /></Field>
          <Field label="Occupation"><Input value={p.occupation || ""} onChange={(e) => set("occupation", e.target.value)} /></Field>
          <Field label="About Me" full><Textarea rows={3} value={p.bio || ""} onChange={(e) => set("bio", e.target.value)} placeholder="Tell us about yourself…" /></Field>
          <Field label="Horoscope (Rasi/Nakshatram)" full><Textarea rows={3} value={p.horoscope || ""} onChange={(e) => set("horoscope", e.target.value)} /></Field>
          <Field label="Family Background" full><Textarea rows={3} value={p.family_details || ""} onChange={(e) => set("family_details", e.target.value)} placeholder="Father, mother, siblings, native place…" /></Field>
          <Field label="Partner Expectations" full><Textarea rows={3} value={p.partner_expectations || ""} onChange={(e) => set("partner_expectations", e.target.value)} /></Field>

          <div className="md:col-span-2">
            <Button onClick={save} disabled={saving} className="w-full bg-gradient-royal text-secondary border border-secondary/30 shadow-elegant" size="lg">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Biodata"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
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

function computeCompletion(p: Partial<Profile>) {
  const fields = ["full_name", "phone", "gender", "date_of_birth", "community", "sub_sect", "education", "occupation", "bio", "horoscope", "family_details", "partner_expectations", "photo_url"] as const;
  const filled = fields.filter((f) => !!p[f]).length;
  return Math.round((filled / fields.length) * 100);
}
