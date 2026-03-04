import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  fetchLinks, fetchFolders, addLink, deleteLink, deleteFolder, createFolder,
  moveLink, checkBrokenLinks, LinkItem, Folder
} from "@/lib/links-api";
import { AddLinkDialog } from "@/components/dashboard/AddLinkDialog";
import { CreateFolderDialog } from "@/components/dashboard/CreateFolderDialog";
import { LinkCard } from "@/components/dashboard/LinkCard";
import { FolderSidebar } from "@/components/dashboard/FolderSidebar";
import { ImportExport } from "@/components/dashboard/ImportExport";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, Search, RefreshCw, AlertTriangle, LayoutGrid, List,
  LogOut, ArrowUpDown, Trash2, Plus, Bookmark
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "title" | "category">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterBroken, setFilterBroken] = useState(false);
  const [checkingBroken, setCheckingBroken] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    setLoadingLinks(true);
    try {
      const [l, f] = await Promise.all([fetchLinks(), fetchFolders()]);
      setLinks(l);
      setFolders(f);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setLoadingLinks(false);
    }
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  // Handlers
  const handleAddLink = async (url: string, folderId?: string | null) => {
    try {
      const link = await addLink(url, folderId);
      setLinks((prev) => [link, ...prev]);
      toast({ title: "Bookmark saved", description: `Categorized as ${link.category}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to add", description: e.message });
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      const folder = await createFolder(name, color);
      setFolders((prev) => [...prev, folder]);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
      if (selectedFolder === id) setSelectedFolder(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleMoveLink = async (linkId: string, folderId: string | null) => {
    try {
      const updated = await moveLink(linkId, folderId);
      setLinks((prev) => prev.map((l) => (l.id === linkId ? updated : l)));
      const folderName = folderId ? folders.find(f => f.id === folderId)?.name : "All Links";
      toast({ title: `Moved to ${folderName}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleCheckBroken = async () => {
    setCheckingBroken(true);
    try {
      const result = await checkBrokenLinks();
      toast({ title: "Check complete", description: `${result.checked} links verified` });
      loadData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setCheckingBroken(false);
    }
  };

  const handleImport = async (imported: { url: string; title?: string }[]) => {
    let count = 0;
    for (const item of imported) {
      try {
        const link = await addLink(item.url);
        setLinks((prev) => [link, ...prev]);
        count++;
      } catch (e) {
        console.error("Import error for", item.url, e);
      }
    }
    toast({ title: "Import complete", description: `${count} bookmarks imported` });
  };

  // Derived
  const categories = useMemo(() => {
    const cats = new Set(links.map((l) => l.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [links]);

  const linkCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of links) {
      if (l.folder_id) counts[l.folder_id] = (counts[l.folder_id] || 0) + 1;
    }
    return counts;
  }, [links]);

  const brokenCount = links.filter((l) => l.is_broken).length;

  const filteredLinks = useMemo(() => {
    let result = [...links];
    if (selectedFolder) result = result.filter((l) => l.folder_id === selectedFolder);
    if (filterCategory !== "all") result = result.filter((l) => l.category === filterCategory);
    if (filterBroken) result = result.filter((l) => l.is_broken);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title?.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.category?.toLowerCase().includes(q) ||
          l.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "title") cmp = (a.title || "").localeCompare(b.title || "");
      else if (sortBy === "category") cmp = (a.category || "").localeCompare(b.category || "");
      else cmp = a.created_at.localeCompare(b.created_at);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [links, selectedFolder, filterCategory, filterBroken, searchQuery, sortBy, sortDir]);

  const currentTitle = selectedFolder
    ? folders.find((f) => f.id === selectedFolder)?.name || "Folder"
    : filterBroken
      ? "Broken Links"
      : "All Bookmarks";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 border-r border-border bg-card/50 h-screen sticky top-0 flex flex-col">
        {/* Logo */}
        <div className="px-4 h-14 flex items-center gap-2.5 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <Bookmark className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-[15px] text-foreground tracking-tight">Bookmark Wallet</span>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-[13px] bg-secondary border-0 rounded-lg placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Library</span>
            </div>
            <FolderSidebar
              folders={[]}
              selectedFolder={selectedFolder}
              onSelect={(id) => { setSelectedFolder(id); setFilterBroken(false); }}
              onDelete={() => {}}
              onDropLink={handleMoveLink}
              linkCounts={linkCounts}
              totalLinks={links.length}
            />
            {brokenCount > 0 && (
              <button
                onClick={() => { setFilterBroken(!filterBroken); setSelectedFolder(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  filterBroken
                    ? "bg-destructive text-destructive-foreground"
                    : "text-destructive/70 hover:text-destructive hover:bg-destructive/5"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="flex-1 text-left">Broken</span>
                <span className="text-[11px] opacity-70 tabular-nums">{brokenCount}</span>
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Folders</span>
              <CreateFolderDialog onCreate={handleCreateFolder} />
            </div>
            <FolderSidebar
              folders={folders}
              selectedFolder={selectedFolder}
              onSelect={(id) => { setSelectedFolder(id); setFilterBroken(false); }}
              onDelete={handleDeleteFolder}
              onDropLink={handleMoveLink}
              linkCounts={linkCounts}
              totalLinks={links.length}
            />
            {folders.length === 0 && (
              <p className="text-[12px] text-muted-foreground/50 px-3 py-2">
                Drag links here to organize
              </p>
            )}
          </div>
        </div>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <span className="flex-1 text-[12px] text-muted-foreground truncate">{user?.email}</span>
            <button
              onClick={signOut}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Top toolbar */}
        <header className="h-14 flex items-center gap-3 px-6 border-b border-border bg-card/30 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold text-foreground truncate">{currentTitle}</h1>
            <p className="text-[11px] text-muted-foreground">
              {filteredLinks.length} bookmark{filteredLinks.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {/* Category filter */}
            {categories.length > 0 && (
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-8 w-auto min-w-[100px] text-[12px] border-0 bg-secondary rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[13px]">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c!} className="text-[13px]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSortBy("created_at"); setSortDir("desc"); }} className="text-[13px]">
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("created_at"); setSortDir("asc"); }} className="text-[13px]">
                  Oldest first
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("title"); setSortDir("asc"); }} className="text-[13px]">
                  Title A–Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("category"); setSortDir("asc"); }} className="text-[13px]">
                  By category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View mode */}
            <div className="flex bg-secondary rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                  viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                  viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Import/Export */}
            <ImportExport links={links} onImport={handleImport} />

            {/* Check broken */}
            <button
              onClick={handleCheckBroken}
              disabled={checkingBroken}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-50"
              title="Check for broken links"
            >
              <RefreshCw className={`w-4 h-4 ${checkingBroken ? "animate-spin" : ""}`} />
            </button>

            {/* Add link */}
            <AddLinkDialog folders={folders} onAdd={handleAddLink} />
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {loadingLinks ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-32"
              >
                <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
              </motion.div>
            ) : filteredLinks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-32"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-7 h-7 text-muted-foreground/30" />
                </div>
                <h3 className="text-[15px] font-medium text-foreground mb-1">No bookmarks</h3>
                <p className="text-[13px] text-muted-foreground mb-4">
                  {searchQuery ? "Try a different search term" : "Add your first bookmark to get started"}
                </p>
                {!searchQuery && (
                  <AddLinkDialog folders={folders} onAdd={handleAddLink} />
                )}
              </motion.div>
            ) : viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
              >
                {filteredLinks.map((link, i) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    folders={folders}
                    onDelete={handleDeleteLink}
                    onMove={handleMoveLink}
                    index={i}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                {filteredLinks.map((link, i) => (
                  <LinkListItem
                    key={link.id}
                    link={link}
                    folders={folders}
                    onDelete={handleDeleteLink}
                    onMove={handleMoveLink}
                    index={i}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

function LinkListItem({ link, folders, onDelete, onMove, index = 0 }: {
  link: LinkItem; folders: Folder[]; onDelete: (id: string) => void; onMove: (linkId: string, folderId: string | null) => void; index?: number;
}) {
  const hostname = (() => { try { return new URL(link.url).hostname.replace("www.", ""); } catch { return link.url; } })();
  const folder = folders.find((f) => f.id === link.folder_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      draggable
      onDragStart={(e: any) => e.dataTransfer?.setData("text/plain", link.id)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-all group cursor-grab active:cursor-grabbing"
      onClick={() => window.open(link.url, "_blank")}
    >
      {link.favicon_url && (
        <img src={link.favicon_url} alt="" className="w-5 h-5 rounded flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-medium text-foreground truncate block">{link.title || hostname}</span>
        <span className="text-[11px] text-muted-foreground truncate block">{hostname}</span>
      </div>
      {link.is_broken && <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
      {link.category && (
        <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full hidden sm:inline">{link.category}</span>
      )}
      {folder && (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground hidden md:flex">
          <span className="w-2 h-2 rounded" style={{ backgroundColor: folder.color }} />
          {folder.name}
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(link.id); }}
        className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

export default Dashboard;
