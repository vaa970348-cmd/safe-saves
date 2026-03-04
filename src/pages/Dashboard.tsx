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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, Search, RefreshCw, AlertTriangle, LayoutGrid, List,
  LogOut, SortAsc, SortDesc, Filter, Trash2
} from "lucide-react";

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

  const handleAddLink = async (url: string, folderId?: string | null) => {
    try {
      const link = await addLink(url, folderId);
      setLinks((prev) => [link, ...prev]);
      toast({ title: "Link added", description: `"${link.title || url}" categorized as ${link.category}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to add link", description: e.message });
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Link deleted" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      const folder = await createFolder(name, color);
      setFolders((prev) => [...prev, folder]);
      toast({ title: "Folder created" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
      if (selectedFolder === id) setSelectedFolder(null);
      toast({ title: "Folder deleted" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleMoveLink = async (linkId: string, folderId: string | null) => {
    try {
      const updated = await moveLink(linkId, folderId);
      setLinks((prev) => prev.map((l) => (l.id === linkId ? updated : l)));
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleCheckBroken = async () => {
    setCheckingBroken(true);
    try {
      const result = await checkBrokenLinks();
      toast({ title: "Link check complete", description: `Checked ${result.checked} links` });
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
    toast({ title: "Import complete", description: `Imported ${count} of ${imported.length} links` });
  };

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="glass border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight hidden sm:inline">
              Bookmark Wallet
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground truncate max-w-[140px] hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 flex-shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Folders</h2>
              <CreateFolderDialog onCreate={handleCreateFolder} />
            </div>
            <FolderSidebar
              folders={folders}
              selectedFolder={selectedFolder}
              onSelect={setSelectedFolder}
              onDelete={handleDeleteFolder}
              linkCounts={linkCounts}
              totalLinks={links.length}
            />

            {brokenCount > 0 && (
              <button
                onClick={() => setFilterBroken(!filterBroken)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  filterBroken ? "bg-destructive text-destructive-foreground" : "text-destructive hover:bg-destructive/10"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="flex-1 text-left">Broken Links</span>
                <Badge variant="destructive" className="text-xs">{brokenCount}</Badge>
              </button>
            )}
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <AddLinkDialog folders={folders} onAdd={handleAddLink} />

              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c!}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
                {sortDir === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>

              <Button variant="outline" size="icon" onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}>
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              </Button>

              <ImportExport links={links} onImport={handleImport} />

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleCheckBroken}
                disabled={checkingBroken}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingBroken ? "animate-spin" : ""}`} />
                Check Links
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{filteredLinks.length} links</span>
              {selectedFolder && (
                <span>in "{folders.find((f) => f.id === selectedFolder)?.name}"</span>
              )}
              {filterCategory !== "all" && <span>• {filterCategory}</span>}
            </div>

            {/* Links grid/list */}
            {loadingLinks ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-20">
                <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No links yet</h3>
                <p className="text-sm text-muted-foreground">Add your first bookmark to get started</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    folders={folders}
                    onDelete={handleDeleteLink}
                    onMove={handleMoveLink}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLinks.map((link) => (
                  <LinkListItem
                    key={link.id}
                    link={link}
                    folders={folders}
                    onDelete={handleDeleteLink}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

function LinkListItem({ link, folders, onDelete }: { link: LinkItem; folders: Folder[]; onDelete: (id: string) => void }) {
  const hostname = (() => { try { return new URL(link.url).hostname; } catch { return link.url; } })();
  const folder = folders.find((f) => f.id === link.folder_id);

  return (
    <div className="glass rounded-lg p-3 flex items-center gap-3 hover:glow-border transition-all group">
      {link.favicon_url && (
        <img src={link.favicon_url} alt="" className="w-5 h-5 rounded-sm flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{link.title || hostname}</span>
          {link.is_broken && <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
        </div>
        <span className="text-xs text-muted-foreground truncate block">{hostname}</span>
      </div>
      {link.category && <Badge variant="secondary" className="text-xs hidden sm:inline-flex">{link.category}</Badge>}
      {folder && <Badge variant="outline" className="text-xs hidden md:inline-flex">{folder.name}</Badge>}
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => window.open(link.url, "_blank")}>
        Open
      </Button>
      <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive opacity-0 group-hover:opacity-100"
        onClick={() => onDelete(link.id)}>
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}


export default Dashboard;
