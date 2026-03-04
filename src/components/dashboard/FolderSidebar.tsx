import { useState } from "react";
import { Folder } from "@/lib/links-api";
import { FolderOpen, Trash2, Inbox, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolder: string | null;
  onSelect: (folderId: string | null) => void;
  onDelete: (id: string) => void;
  onDropLink: (linkId: string, folderId: string | null) => void;
  linkCounts: Record<string, number>;
  totalLinks: number;
}

export function FolderSidebar({
  folders,
  selectedFolder,
  onSelect,
  onDelete,
  onDropLink,
  linkCounts,
  totalLinks,
}: FolderSidebarProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, id: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id ?? "__all__");
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const linkId = e.dataTransfer.getData("text/plain");
    if (linkId) onDropLink(linkId, folderId);
    setDragOverId(null);
  };

  const handleDragLeave = () => setDragOverId(null);

  return (
    <nav className="space-y-0.5">
      {/* All Links */}
      <button
        onClick={() => onSelect(null)}
        onDragOver={(e) => handleDragOver(e, null)}
        onDrop={(e) => handleDrop(e, null)}
        onDragLeave={handleDragLeave}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
          selectedFolder === null
            ? "bg-foreground text-primary-foreground"
            : "text-foreground/70 hover:text-foreground hover:bg-secondary",
          dragOverId === "__all__" && "ring-2 ring-glow/30 bg-glow/5"
        )}
      >
        <Inbox className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">All Links</span>
        <span className="text-[11px] font-normal opacity-50 tabular-nums">{totalLinks}</span>
      </button>

      {/* Folders */}
      <AnimatePresence>
        {folders.map((folder, i) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="group"
          >
            <div
              onDragOver={(e) => handleDragOver(e, folder.id)}
              onDrop={(e) => handleDrop(e, folder.id)}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex items-center rounded-lg transition-all duration-150",
                dragOverId === folder.id && "ring-2 ring-glow/30 bg-glow/5"
              )}
            >
              <button
                onClick={() => onSelect(folder.id)}
                className={cn(
                  "flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                  selectedFolder === folder.id
                    ? "bg-foreground text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                )}
              >
                <span
                  className="w-3 h-3 rounded flex-shrink-0"
                  style={{ backgroundColor: folder.color }}
                />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <span className="text-[11px] font-normal opacity-50 tabular-nums">{linkCounts[folder.id] || 0}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(folder.id); }}
                className="w-7 h-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all mr-0.5"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </nav>
  );
}
