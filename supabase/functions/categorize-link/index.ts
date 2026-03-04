import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, title, description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Categorize this webpage into exactly ONE category and suggest up to 3 relevant tags.

URL: ${url}
Title: ${title || "Unknown"}
Description: ${description || "None"}

Categories to choose from: Technology, News, Social Media, Entertainment, Education, Shopping, Finance, Health, Travel, Food, Sports, Design, Development, Business, Science, Reference, Gaming, Music, Video, Photography, Productivity, Communication, Other

Respond with a JSON object: {"category": "string", "tags": ["tag1", "tag2"]}
Only respond with the JSON, nothing else.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a URL categorization assistant. Respond only with valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ category: "Other", tags: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let category = "Other";
    let tags: string[] = [];

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        category = parsed.category || "Other";
        tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [];
      }
    } catch {
      console.error("Failed to parse AI response:", content);
    }

    return new Response(
      JSON.stringify({ category, tags }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("categorize-link error:", e);
    return new Response(
      JSON.stringify({ category: "Other", tags: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
