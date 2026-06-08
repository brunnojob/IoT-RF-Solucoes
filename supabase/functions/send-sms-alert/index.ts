import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const DESTINATARIOS = [
  "+5521997670015",
  "+5521971557079",
  "+5521991711252",
];

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, kind } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "message obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const FROM = Deno.env.get("TWILIO_FROM_NUMBER");

    if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !FROM) {
      return new Response(
        JSON.stringify({
          error: "Twilio não configurado (LOVABLE_API_KEY / TWILIO_API_KEY / TWILIO_FROM_NUMBER)",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = await Promise.all(
      DESTINATARIOS.map(async (To) => {
        const r = await fetch(`${GATEWAY_URL}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": TWILIO_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ To, From: FROM, Body: message }),
        });
        const data = await r.json().catch(() => ({}));
        return { To, status: r.status, ok: r.ok, data };
      })
    );

    console.log(`[sms:${kind}] enviados:`, JSON.stringify(results));

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro desconhecido";
    console.error("Erro send-sms-alert:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
