import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { budget, lifestyle } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `A person has a monthly budget of ₹${budget} and 
          describes their lifestyle as: "${lifestyle}". 
          Suggest realistic monthly spending limits in INR for these 
          6 categories: Food, Transport, Entertainment, Study, Rent, Other.
          The limits must add up to exactly ₹${budget}.
          Respond with ONLY a valid JSON object like:
          {"Food": 2000, "Transport": 500, "Entertainment": 300, 
           "Study": 400, "Rent": 3000, "Other": 200}
          No explanation, no markdown, no code blocks. Just the JSON.`,
        }],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;
    const suggested = JSON.parse(text);

    return new Response(JSON.stringify(suggested), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});