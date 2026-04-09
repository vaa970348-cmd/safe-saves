import { supabase } from "@/integrations/supabase/client";

export interface LinkItem {
  id: string;
  user_id: string;
  folder_id: string | null;
  url: string;
  title: string | null;
  description: string | null;
  favicon_url: string | null;
  screenshot_url: string | null;
  category: string | null;
  tags: string[];
  is_broken: boolean;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchLinks(folderId?: string | null, category?: string | null) {
  let query = supabase.from("links").select("*").order("created_at", { ascending: false });
  if (folderId) query = query.eq("folder_id", folderId);
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as LinkItem[];
}

export async function fetchFolders() {
  const { data, error } = await supabase.from("folders").select("*").order("name");
  if (error) throw error;
  return (data || []) as Folder[];
}

export async function createFolder(name: string, color: string = "#6B7280") {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("folders")
    .insert({ name, color, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as Folder;
}

export async function deleteFolder(id: string) {
  const { error } = await supabase.from("folders").delete().eq("id", id);
  if (error) throw error;
}

export async function addLink(url: string, folderId?: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch metadata
  let metadata: any = {};
  try {
    const { data } = await supabase.functions.invoke("fetch-link-metadata", { body: { url } });
    metadata = data || {};
  } catch (e) {
    console.error("Metadata fetch failed:", e);
  }

  // AI categorization
  let aiResult: any = { category: "Other", tags: [] };
  try {
    const { data } = await supabase.functions.invoke("categorize-link", {
      body: { url, title: metadata.title, description: metadata.description },
    });
    aiResult = data || aiResult;
  } catch (e) {
    console.error("Categorization failed:", e);
  }

  const { data: link, error } = await supabase
    .from("links")
    .insert({
      url,
      user_id: user.id,
      folder_id: folderId || null,
      title: metadata.title || null,
      description: metadata.description || null,
      favicon_url: metadata.favicon_url || null,
      screenshot_url: metadata.screenshot_url || null,
      is_broken: metadata.is_broken || false,
      category: aiResult.category,
      tags: aiResult.tags || [],
    })
    .select()
    .single();

  if (error) throw error;
  return link as LinkItem;
}

export async function deleteLink(id: string) {
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) throw error;
}

export async function updateLink(id: string, updates: Partial<LinkItem>) {
  const { data, error } = await supabase
    .from("links")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as LinkItem;
}

export async function moveLink(linkId: string, folderId: string | null) {
  return updateLink(linkId, { folder_id: folderId } as any);
}

export async function checkBrokenLinks() {
  const { data, error } = await supabase.functions.invoke("check-broken-links");
  // supabase.functions.invoke may set error even on 2xx when response parsing fails
  // If we got data back, treat it as success regardless of error
  if (data && typeof data === "object" && "checked" in data) {
    return data as { checked: number; results: any[] };
  }
  if (error) throw error;
  return data;
}

export function exportLinks(links: LinkItem[]): string {
  return JSON.stringify(links.map(l => ({
    url: l.url,
    title: l.title,
    description: l.description,
    category: l.category,
    tags: l.tags,
    folder_id: l.folder_id,
  })), null, 2);
}

export function exportLinksAsHTML(links: LinkItem[]): string {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n`;
  for (const l of links) {
    html += `  <DT><A HREF="${l.url}">${l.title || l.url}</A>\n`;
    if (l.description) html += `  <DD>${l.description}\n`;
  }
  html += `</DL><p>\n`;
  return html;
}

export function parseImportedLinks(content: string): { url: string; title?: string }[] {
  const links: { url: string; title?: string }[] = [];

  // Try JSON
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item.url) links.push({ url: item.url, title: item.title });
      }
      return links;
    }
  } catch {}

  // Try HTML bookmark format
  const regex = /<A[^>]*HREF="([^"]*)"[^>]*>(.*?)<\/A>/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push({ url: match[1], title: match[2] });
  }

  if (links.length === 0) {
    // Try line-by-line URLs
    const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith("http://") || line.startsWith("https://")) {
        links.push({ url: line });
      }
    }
  }

  return links;
}
