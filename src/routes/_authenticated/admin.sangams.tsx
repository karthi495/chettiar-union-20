import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/sangams")({
  component: AdminSangams,
});

type Sangam = Tables<"sangams">;
type SangamInput = TablesInsert<"sangams">;

const empty: SangamInput = {
  slug: "",
  sangam_name_en: "",
  sangam_name_ta: "",
  community_name: "Chettiar",
  district: "",
  city: "",
  address_en: "",
  address_ta: "",
  contact_person: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  office_timing_en: "",
  office_timing_ta: "",
  founded_year: null,
  total_members: 0,
  registered_families: 0,
  marriage_success_count: 0,
  active_events: 0,
  description_en: "",
  description_ta: "",
  map_link: "",
  image_url: "",
  blood_donation_info: "",
  marriage_help_info: "",
  educational_support_info: "",
  is_featured: false,
  is_popular: false,
  is_approved: true,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminSangams() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<SangamInput | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const { data: sangams = [] } = useQuery({
    queryKey: ["admin-sangams"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase.from("sangams").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div className="glass p-10 rounded-2xl shadow-elegant max-w-md">
            <ShieldAlert className="w-10 h-10 mx-auto text-primary mb-3" />
            <h1 className="font-display text-2xl text-primary">Admin access required</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Your account isn't an admin yet. Ask the platform owner to grant you the <code>admin</code> role in the <code>user_roles</code> table.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, slug: editing.slug || slugify(editing.sangam_name_en) };
    const { error } = (editing as Sangam).id
      ? await supabase.from("sangams").update(payload).eq("id", (editing as Sangam).id)
      : await supabase.from("sangams").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-sangams"] });
    qc.invalidateQueries({ queryKey: ["sangams"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this Sangam?")) return;
    const { error } = await supabase.from("sangams").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-sangams"] });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-6xl w-full px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl text-primary">Admin · Sangams</h1>
          <Button onClick={() => setEditing(empty)} className="bg-gradient-royal text-secondary"><Plus className="w-4 h-4 mr-1.5" />Add Sangam</Button>
        </div>

        <div className="glass rounded-2xl shadow-elegant overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase">
              <tr><th className="p-3">Name</th><th className="p-3">District</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {sangams.map((s) => (
                <tr key={s.id} className="border-t border-border/40">
                  <td className="p-3"><div className="font-medium">{s.sangam_name_en}</div><div className="text-xs text-muted-foreground" lang="ta">{s.sangam_name_ta}</div></td>
                  <td className="p-3">{s.district}</td>
                  <td className="p-3">
                    {s.is_approved ? <span className="text-emerald-700 text-xs">Approved</span> : <span className="text-amber-700 text-xs">Pending</span>}
                    {s.is_featured && <span className="ml-2 text-xs text-secondary-foreground">★ Featured</span>}
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(s)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {sangams.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">No sangams yet. Add the first one.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{(editing as Sangam | null)?.id ? "Edit" : "Add"} Sangam</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Name (English) *"><Input value={editing.sangam_name_en} onChange={(e) => setEditing({ ...editing, sangam_name_en: e.target.value, slug: editing.slug || slugify(e.target.value) })} /></Field>
              <Field label="Name (Tamil)"><Input value={editing.sangam_name_ta ?? ""} onChange={(e) => setEditing({ ...editing, sangam_name_ta: e.target.value })} lang="ta" /></Field>
              <Field label="Slug *"><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} /></Field>
              <Field label="Community"><Input value={editing.community_name ?? ""} onChange={(e) => setEditing({ ...editing, community_name: e.target.value })} /></Field>
              <Field label="District"><Input value={editing.district ?? ""} onChange={(e) => setEditing({ ...editing, district: e.target.value })} /></Field>
              <Field label="City"><Input value={editing.city ?? ""} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></Field>
              <Field label="Address (English)" full><Textarea value={editing.address_en ?? ""} onChange={(e) => setEditing({ ...editing, address_en: e.target.value })} /></Field>
              <Field label="Address (Tamil)" full><Textarea value={editing.address_ta ?? ""} onChange={(e) => setEditing({ ...editing, address_ta: e.target.value })} lang="ta" /></Field>
              <Field label="Contact Person"><Input value={editing.contact_person ?? ""} onChange={(e) => setEditing({ ...editing, contact_person: e.target.value })} /></Field>
              <Field label="Phone"><Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></Field>
              <Field label="WhatsApp"><Input value={editing.whatsapp ?? ""} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} /></Field>
              <Field label="Email"><Input value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
              <Field label="Website"><Input value={editing.website ?? ""} onChange={(e) => setEditing({ ...editing, website: e.target.value })} /></Field>
              <Field label="Founded Year"><Input type="number" value={editing.founded_year ?? ""} onChange={(e) => setEditing({ ...editing, founded_year: e.target.value ? parseInt(e.target.value) : null })} /></Field>
              <Field label="Office Timing (EN)"><Input value={editing.office_timing_en ?? ""} onChange={(e) => setEditing({ ...editing, office_timing_en: e.target.value })} /></Field>
              <Field label="Office Timing (TA)"><Input value={editing.office_timing_ta ?? ""} onChange={(e) => setEditing({ ...editing, office_timing_ta: e.target.value })} lang="ta" /></Field>
              <Field label="Total Members"><Input type="number" value={editing.total_members ?? 0} onChange={(e) => setEditing({ ...editing, total_members: parseInt(e.target.value || "0") })} /></Field>
              <Field label="Registered Families"><Input type="number" value={editing.registered_families ?? 0} onChange={(e) => setEditing({ ...editing, registered_families: parseInt(e.target.value || "0") })} /></Field>
              <Field label="Marriage Successes"><Input type="number" value={editing.marriage_success_count ?? 0} onChange={(e) => setEditing({ ...editing, marriage_success_count: parseInt(e.target.value || "0") })} /></Field>
              <Field label="Active Events"><Input type="number" value={editing.active_events ?? 0} onChange={(e) => setEditing({ ...editing, active_events: parseInt(e.target.value || "0") })} /></Field>
              <Field label="Cover Image URL" full><Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></Field>
              <Field label="Google Maps Link" full><Input value={editing.map_link ?? ""} onChange={(e) => setEditing({ ...editing, map_link: e.target.value })} /></Field>
              <Field label="Description (English)" full><Textarea rows={3} value={editing.description_en ?? ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} /></Field>
              <Field label="Description (Tamil)" full><Textarea rows={3} value={editing.description_ta ?? ""} onChange={(e) => setEditing({ ...editing, description_ta: e.target.value })} lang="ta" /></Field>
              <Field label="Blood Donation Info" full><Textarea rows={2} value={editing.blood_donation_info ?? ""} onChange={(e) => setEditing({ ...editing, blood_donation_info: e.target.value })} /></Field>
              <Field label="Marriage Help Info" full><Textarea rows={2} value={editing.marriage_help_info ?? ""} onChange={(e) => setEditing({ ...editing, marriage_help_info: e.target.value })} /></Field>
              <Field label="Educational Support Info" full><Textarea rows={2} value={editing.educational_support_info ?? ""} onChange={(e) => setEditing({ ...editing, educational_support_info: e.target.value })} /></Field>

              <div className="md:col-span-2 flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm"><Switch checked={!!editing.is_featured} onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })} /> Featured</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={!!editing.is_popular} onCheckedChange={(v) => setEditing({ ...editing, is_popular: v })} /> Popular</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={!!editing.is_approved} onCheckedChange={(v) => setEditing({ ...editing, is_approved: v })} /> Approved</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} className="bg-gradient-royal text-secondary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
