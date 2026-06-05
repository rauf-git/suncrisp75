import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inquiryService, InquirySubmission } from "@/services/inquiryService";
import { RefreshCw, Trash2, Eye, Mail } from "lucide-react";
import { format } from "date-fns";

export function InquirySubmissionsList() {
  const { toast } = useToast();
  const [items, setItems] = useState<InquirySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<InquirySubmission | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await inquiryService.listAll();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load inquiries",
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    const { error } = await inquiryService.delete(id);
    if (error) {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    } else {
      setItems((p) => p.filter((i) => i.id !== id));
      toast({ title: "Deleted" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-foreground">Inquiries</h2>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <Mail className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No inquiries yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-3 max-w-xs truncate">{s.project_title || "—"}</td>
                    <td className="px-4 py-3">{s.submitter_name || "—"}</td>
                    <td className="px-4 py-3">{s.submitter_email || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          s.email_status === "sent"
                            ? "bg-green-500/10 text-green-600"
                            : s.email_status === "failed"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.email_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(s.created_at), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => setViewing(s)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {viewing?.project_title || "Inquiry"}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Received {format(new Date(viewing.created_at), "PPpp")}
              </p>
              <div className="space-y-2">
                {Object.entries(viewing.data || {}).map(([k, v]) => (
                  <div key={k} className="border-b border-border pb-2">
                    <div className="text-xs uppercase text-muted-foreground">{k}</div>
                    <div className="text-sm whitespace-pre-wrap">{String(v) || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
