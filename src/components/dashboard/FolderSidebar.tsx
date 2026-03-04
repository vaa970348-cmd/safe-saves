import { Folder } from "@/lib/links-api";
import { FolderOpen, Trash2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolder: string | null;
  onSelect: (folderId: string | null) => void;
  onDelete: (id: string) => void;
  linkCounts: Record<string, number>;
  totalLinks: number;
}

export function FolderSidebar({
  folders,
  selectedFolder,
  onSelect,
  onDelete,
  linkCounts,
  totalLinks,
}: FolderSidebarProps) {
  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
          selectedFolder === null
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Inbox className="w-4 h-4" />
        <span className="flex-1 text-left">All Links</span>
        <span className="text-xs opacity-70">{totalLinks}</span>
      </button>

      {folders.map((folder) => (
        <div key={folder.id} className="group flex items-center">
          <button
            onClick={() => onSelect(folder.id)}
            className={cn(
              "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              selectedFolder === folder.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <FolderOpen className="w-4 h-4" style={{ color: selectedFolder === folder.id ? undefined : folder.color }} />
            <span className="flex-1 text-left truncate">{folder.name}</span>
            <span className="text-xs opacity-70">{linkCounts[folder.id] || 0}</span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
            onClick={() => onDelete(folder.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
