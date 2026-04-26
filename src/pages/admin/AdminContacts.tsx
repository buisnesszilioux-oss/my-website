import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { api, type ContactSubmission } from "@/lib/api";
import { Trash2, Mail, Phone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminContacts = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery<ContactSubmission[]>({ queryKey: ["/api/admin/contacts"], queryFn: () => api("/api/admin/contacts") });
  const del = useMutation({
    mutationFn: (id: number) => api(`/api/admin/contacts/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/contacts"] }); toast({ title: "Deleted" }); },
  });

  return (
    <AdminLayout>
      <h1 className="font-heading text-3xl font-bold mb-2">Contact Submissions</h1>
      <p className="text-muted-foreground mb-6 text-sm">Messages submitted via the website contact form.</p>

      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((c) => (
            <div key={c.id} className="bg-card rounded-lg border border-border p-5" data-testid={`card-contact-${c.id}`}>
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <div className="font-heading text-lg font-semibold text-foreground">{c.fullName}</div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                    <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
                    <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.phone}</span>
                    {c.companyName && <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {c.companyName}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
                  <button onClick={() => { if (confirm("Delete this submission?")) del.mutate(c.id); }} data-testid={`button-delete-contact-${c.id}`} className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap bg-secondary/30 rounded-md p-3 border border-border">{c.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-10 text-center text-muted-foreground">No submissions yet.</div>
      )}
    </AdminLayout>
  );
};

export default AdminContacts;
