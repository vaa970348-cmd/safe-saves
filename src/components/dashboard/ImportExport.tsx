import { useRef } from "react";
import { Download, Upload } from "lucide-react";
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
    <div className="flex gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".json,.html,.htm,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
        <Upload className="w-3.5 h-3.5" /> Import
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleExportJSON}>Export as JSON</DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportHTML}>Export as HTML (Bookmarks)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
