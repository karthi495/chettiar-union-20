import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Trash2, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_authenticated/admin/community")({
  component: AdminCommunity,
});

function AdminCommunity() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const { data: rows = [] } = useQuery({
    queryKey: ["admin-community"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase.from("community_directory").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div className="glass p-10 rounded-2xl shadow-elegant max-w-md">
            <ShieldAlert className="w-10 h-10 mx-auto text-primary mb-3" />
            <h1 className="font-display text-2xl text-primary">Admin access required</h1>
            <p className="text-sm text-muted-foreground mt-2">Ask the platform owner to grant you the <code>admin</code> role.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const setApproved = async (id: string, v: boolean) => {
    const { error } = await supabase.from("community_directory").update({ is_approved: v }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(v ? "Approved" : "Unapproved");
    qc.invalidateQueries({ queryKey: ["admin-community"] });
    qc.invalidateQueries({ queryKey: ["community-directory"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("community_directory").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-community"] });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-6xl w-full px-6 py-10 flex-1">
        <h1 className="font-display text-3xl text-primary mb-6">Admin · Community Directory</h1>
        <div className="glass rounded-2xl shadow-elegant overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase">
              <tr><th className="p-3">Family</th><th className="p-3">Location</th><th className="p-3">Contact</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/40">
                  <td className="p-3"><div className="font-medium">{r.family_name}</div><div className="text-xs text-muted-foreground">{r.full_name} · {r.community_type}</div></td>
                  <td className="p-3 text-xs">{[r.city, r.district].filter(Boolean).join(", ")}</td>
                  <td className="p-3 text-xs">{r.phone || r.whatsapp || r.email}</td>
                  <td className="p-3">{r.is_approved ? <span className="text-emerald-700 text-xs">Approved</span> : <span className="text-amber-700 text-xs">Pending</span>}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {r.is_approved ? (
                      <Button variant="ghost" size="icon" onClick={() => setApproved(r.id, false)} title="Unapprove"><X className="w-4 h-4" /></Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => setApproved(r.id, true)} title="Approve"><Check className="w-4 h-4 text-emerald-700" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No listings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
