import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_authenticated/community/register")({
  component: RegisterFamily,
});

const FUNCTION_TYPES = ["Wedding", "Ear Piercing", "House Warming", "Temple Function", "Business", "Others"];
const VISIBILITY = [
  { v: "public", l: "Public — visible to everyone" },
  { v: "community", l: "Community only — signed-in members" },
  { v: "hidden", l: "Hidden — only me & admins" },
];

function RegisterFamily() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    family_name: "",
    community_type: "Chettiar",
    gothram: "",
    district: "",
    city: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: user?.email ?? "",
    profession: "",
    function_type: "",
    description: "",
    visibility: "public",
    hide_address: false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const upload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: max 5MB`);
          continue;
        }
        const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const { error } = await supabase.storage.from("community-photos").upload(path, file);
        if (error) { toast.error(error.message); continue; }
        const { data } = supabase.storage.from("community-photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setImages((prev) => [...prev, ...urls]);
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!user) return;
    if (!form.full_name.trim() || !form.family_name.trim()) {
      toast.error("Full name and family name are required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("community_directory").insert({
      ...form,
      user_id: user.id,
      image_urls: images,
      is_approved: false,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Submitted! An admin will review your listing.");
    nav({ to: "/community" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-3xl w-full px-6 py-10 flex-1">
        <h1 className="font-display text-3xl text-primary">Register your family</h1>
        <p className="text-muted-foreground mt-1">Help fellow community members find and connect with you. Listings are reviewed before going live.</p>

        <div className="glass rounded-2xl shadow-elegant p-6 mt-6 grid md:grid-cols-2 gap-4">
          <Field label="Full Name *"><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
          <Field label="Family Name *"><Input value={form.family_name} onChange={(e) => set("family_name", e.target.value)} /></Field>
          <Field label="Community Type"><Input value={form.community_type} onChange={(e) => set("community_type", e.target.value)} /></Field>
          <Field label="Gothram"><Input value={form.gothram} onChange={(e) => set("gothram", e.target.value)} /></Field>
          <Field label="District"><Input value={form.district} onChange={(e) => set("district", e.target.value)} /></Field>
          <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="Full Address" full><Textarea value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="WhatsApp"><Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Profession"><Input value={form.profession} onChange={(e) => set("profession", e.target.value)} /></Field>
          <Field label="Function Type">
            <select value={form.function_type} onChange={(e) => set("function_type", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              <option value="">Select...</option>
              {FUNCTION_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Visibility">
            <select value={form.visibility} onChange={(e) => set("visibility", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              {VISIBILITY.map((v) => <option key={v.v} value={v.v}>{v.l}</option>)}
            </select>
          </Field>
          <Field label="Short Description" full><Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>

          <div className="md:col-span-2">
            <Label className="text-xs">Photos (family / function / wedding hall)</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {images.map((u, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                  <img src={u} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer text-xs text-muted-foreground hover:border-primary">
                <Upload className="w-5 h-5 mb-1" />
                {uploading ? "..." : "Upload"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
              </label>
            </div>
          </div>

          <label className="md:col-span-2 flex items-center gap-3 text-sm">
            <Switch checked={form.hide_address} onCheckedChange={(v) => set("hide_address", v)} />
            Hide my full address (still searchable by city/district)
          </label>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => nav({ to: "/community" })}>Cancel</Button>
            <Button onClick={submit} disabled={saving} className="bg-gradient-royal text-secondary">
              {saving ? "Submitting..." : "Submit for review"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
