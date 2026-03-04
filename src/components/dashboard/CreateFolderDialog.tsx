import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const FOLDER_COLORS = [
  "#8E8E93", "#FF3B30", "#FF9500", "#34C759", "#007AFF", "#AF52DE", "#FF2D55", "#5AC8FA",
];

interface CreateFolderDialogProps {
  onCreate: (name: string, color: string) => Promise<void>;
}

export function CreateFolderDialog({ onCreate }: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[4]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate(name.trim(), color);
      setName("");
      setColor(FOLDER_COLORS[4]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-semibold">New folder</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Organize your bookmarks into collections.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium">Name</Label>
            <Input
              placeholder="Work, Design, Reading..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="h-10 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium">Color</Label>
            <div className="flex gap-2.5">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all duration-200 ${
                    color === c ? "ring-2 ring-offset-2 ring-foreground/20 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full h-10 rounded-lg font-medium text-[13px]" disabled={loading}>
            {loading ? "Creating..." : "Create Folder"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
