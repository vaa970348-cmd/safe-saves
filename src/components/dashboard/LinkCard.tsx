import { LinkItem } from "@/lib/links-api";
import { ExternalLink, Trash2, AlertTriangle, Tag, FolderOpen, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder } from "@/lib/links-api";

interface LinkCardProps {
  link: LinkItem;
  folders: Folder[];
  onDelete: (id: string) => void;
  onMove: (linkId: string, folderId: string | null) => void;
}

export function LinkCard({ link, folders, onDelete, onMove }: LinkCardProps) {
  const hostname = (() => {
    try { return new URL(link.url).hostname; } catch { return link.url; }
  })();

  const folder = folders.find((f) => f.id === link.folder_id);

  return (
    <div className="glass rounded-xl overflow-hidden group hover:glow-border transition-all duration-300">
      {/* Screenshot / Preview */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {link.screenshot_url ? (
          <img
            src={link.screenshot_url}
            alt={link.title || "Link preview"}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-card">
            <ExternalLink className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        {link.is_broken && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-md px-2 py-1 text-xs font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Broken
          </div>
        )}
        {link.category && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-card/80">
              {link.category}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start gap-2">
          {link.favicon_url && (
            <img
              src={link.favicon_url}
              alt=""
              className="w-4 h-4 mt-1 rounded-sm flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {link.title || hostname}
            </h3>
            <p className="text-xs text-muted-foreground truncate">{hostname}</p>
          </div>
        </div>

        {link.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{link.description}</p>
        )}

        {link.tags && link.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {link.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {folder && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FolderOpen className="w-3 h-3" />
            <span>{folder.name}</span>
          </div>
        )}

        <div className="flex items-center gap-1 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={() => window.open(link.url, "_blank")}
          >
            <ExternalLink className="w-3 h-3 mr-1" /> Open
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => onDelete(link.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
