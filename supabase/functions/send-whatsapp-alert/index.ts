import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors";

const DESTINATARIOS = [
  "5521997670015",
  "5521971557079",
  "5521991711252",
];

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

    const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
    const instanceToken = Deno.env.get("ZAPI_INSTANCE_TOKEN");
    const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

    if (!instanceId || !instanceToken || !clientToken) {
      return new Response(
        JSON.stringify({ error: "Z-API não configurada (ZAPI_INSTANCE_ID, ZAPI_INSTANCE_TOKEN, ZAPI_CLIENT_TOKEN)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = `https://api.z-api.io/instances/${instanceId}/token/${instanceToken}/send-text`;

    const results = await Promise.all(
      DESTINATARIOS.map(async (phone) => {
        const r = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Token": clientToken,
          },
          body: JSON.stringify({ phone, message }),
        });
        const data = await r.json().catch(() => ({}));
        return { phone, status: r.status, ok: r.ok, data };
      })
    );

    console.log(`[whatsapp:${kind}] enviados:`, JSON.stringify(results));

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro desconhecido";
    console.error("Erro send-whatsapp-alert:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
