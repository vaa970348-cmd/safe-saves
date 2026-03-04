import { useRef } from "react";
import { Download, Upload, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkItem, exportLinks, exportLinksAsHTML, parseImportedLinks } from "@/lib/links-api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ImportExportProps {
  links: LinkItem[];
  onImport: (links: { url: string; title?: string }[]) => Promise<void>;
}

export function ImportExport({ links, onImport }: ImportExportProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const blob = new Blob([exportLinks(links)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    const blob = new Blob([exportLinksAsHTML(links)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    const parsed = parseImportedLinks(content);
    if (parsed.length > 0) {
      await onImport(parsed);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.html,.htm,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        title="Import bookmarks"
      >
        <Upload className="w-4 h-4" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title="Export bookmarks"
          >
            <Download className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportJSON} className="text-[13px]">
            <FileDown className="w-3.5 h-3.5 mr-2" /> Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportHTML} className="text-[13px]">
            <FileDown className="w-3.5 h-3.5 mr-2" /> Export as HTML
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
