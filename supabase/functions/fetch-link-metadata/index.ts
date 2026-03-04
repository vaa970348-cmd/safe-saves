import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the page
    let html = "";
    let finalUrl = url;
    let is_broken = false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; BookmarkWallet/1.0)" },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);
      finalUrl = response.url;
      is_broken = !response.ok;
      if (response.ok) {
        html = await response.text();
      }
    } catch {
      is_broken = true;
    }

    // Parse metadata from HTML
    let title = "";
    let description = "";
    let favicon_url = "";

    if (html) {
      // Title
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
      title = ogTitleMatch?.[1] || titleMatch?.[1] || "";
      title = title.trim().substring(0, 500);

      // Description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
      description = ogDescMatch?.[1] || descMatch?.[1] || "";
      description = description.trim().substring(0, 1000);

      // Favicon
      const iconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*)["']/i);
      if (iconMatch?.[1]) {
        favicon_url = iconMatch[1];
        if (favicon_url.startsWith("/")) {
          const urlObj = new URL(finalUrl);
          favicon_url = `${urlObj.origin}${favicon_url}`;
        } else if (!favicon_url.startsWith("http")) {
          const urlObj = new URL(finalUrl);
          favicon_url = `${urlObj.origin}/${favicon_url}`;
        }
      } else {
        const urlObj = new URL(finalUrl);
        favicon_url = `${urlObj.origin}/favicon.ico`;
      }

      // OG Image as screenshot
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
      var screenshot_url = ogImageMatch?.[1] || "";
      if (screenshot_url && screenshot_url.startsWith("/")) {
        const urlObj = new URL(finalUrl);
        screenshot_url = `${urlObj.origin}${screenshot_url}`;
      }
    }

    return new Response(
      JSON.stringify({
        title: title || new URL(url).hostname,
        description,
        favicon_url,
        screenshot_url: screenshot_url || "",
        is_broken,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fetch-link-metadata error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
