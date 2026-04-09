import { useState, useRef } from "react";
import { LinkItem, Folder } from "@/lib/links-api";
import { ExternalLink, Trash2, AlertTriangle, FolderOpen, GripVertical, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface LinkCardProps {
  link: LinkItem;
  folders: Folder[];
  onDelete: (id: string) => void;
  onMove: (linkId: string, folderId: string | null) => void;
  index?: number;
}

export function LinkCard({ link, folders, onDelete, onMove, index = 0 }: LinkCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const hostname = (() => {
    try { return new URL(link.url).hostname.replace("www.", ""); } catch { return link.url; }
  })();

  const folder = folders.find((f) => f.id === link.folder_id);

  const screenshotSrc = link.screenshot_url || (() => {
    try {
      const u = new URL(link.url);
      return `https://image.thum.io/get/width/600/crop/400/${u.href}`;
    } catch { return ""; }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      draggable
      onDragStart={(e: any) => {
        setIsDragging(true);
        e.dataTransfer?.setData("text/plain", link.id);
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`surface-card surface-card-hover group cursor-grab active:cursor-grabbing overflow-hidden ${isDragging ? "opacity-40 scale-[0.97]" : ""}`}
    >
      {/* Screenshot */}
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {screenshotSrc ? (
          <img
            src={screenshotSrc}
            alt={link.title || ""}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              if (el.nextElementSibling) el.nextElementSibling.classList.remove("hidden");
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent/30 ${screenshotSrc ? "hidden absolute inset-0" : ""}`}>
          <ExternalLink className="w-8 h-8 text-muted-foreground/20" />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {link.is_broken && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-destructive/90 text-destructive-foreground backdrop-blur-sm">
              <AlertTriangle className="w-3 h-3" /> Broken
            </span>
          )}
        </div>

        {/* Quick action */}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-sm">
                <MoreHorizontal className="w-3.5 h-3.5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass">
              <DropdownMenuItem onClick={() => window.open(link.url, "_blank")}>
                <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open in new tab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(link.url)}>
                Copy URL
              </DropdownMenuItem>
              {folders.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <FolderOpen className="w-3.5 h-3.5 mr-2" /> Move to folder
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => onMove(link.id, null)}>
                        No folder
                      </DropdownMenuItem>
                      {folders.map((f) => (
                        <DropdownMenuItem key={f.id} onClick={() => onMove(link.id, f.id)}>
                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: f.color }} />
                          {f.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(link.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-1.5" onClick={() => window.open(link.url, "_blank")}>
        <div className="flex items-center gap-2">
          {link.favicon_url && (
            <img
              src={link.favicon_url}
              alt=""
              className="w-4 h-4 rounded flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <h3 className="font-semibold text-[13px] text-foreground truncate leading-tight flex-1">
            {link.title || hostname}
          </h3>
        </div>

        <p className="text-[11px] text-muted-foreground truncate">{hostname}</p>

        {link.description && (
          <p className="text-[11px] text-muted-foreground/70 line-clamp-2 leading-relaxed">{link.description}</p>
        )}

        <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
          {link.category && (
            <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {link.category}
            </span>
          )}
          {link.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] text-muted-foreground/60 bg-secondary/50 px-1.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          {folder && (
            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color }} />
              {folder.name}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
