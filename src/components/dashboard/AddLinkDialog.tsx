import { useState } from "react";
import { Plus, Link as LinkIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Folder } from "@/lib/links-api";

interface AddLinkDialogProps {
  folders: Folder[];
  onAdd: (url: string, folderId?: string | null) => Promise<void>;
}

export function AddLinkDialog({ folders, onAdd }: AddLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [folderId, setFolderId] = useState<string>("none");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      let finalUrl = url.trim();
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = `https://${finalUrl}`;
      }
      await onAdd(finalUrl, folderId === "none" ? null : folderId);
      setUrl("");
      setFolderId("none");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 rounded-lg h-9 px-3.5 font-medium text-[13px]">
          <Plus className="w-4 h-4" /> Add Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-semibold">Add new bookmark</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Paste a URL and we'll automatically fetch its details and categorize it with AI.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium">URL</Label>
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              autoFocus
              className="h-10 text-[13px]"
            />
          </div>
          {folders.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Folder</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger className="h-10 text-[13px]">
                  <SelectValue placeholder="No folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded" style={{ backgroundColor: f.color }} />
                        {f.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit" className="w-full h-10 rounded-lg font-medium text-[13px]" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Analyzing...
              </span>
            ) : (
              "Save Bookmark"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
