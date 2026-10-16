import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
const DESTINATARIOS = [
    "+5521997670015",
    "+5521971557079",
    "+5521991711252",
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
        const ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
        const AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
        const FROM = Deno.env.get("TWILIO_FROM_NUMBER");
        if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM) {
            return new Response(JSON.stringify({
                error: "Twilio não configurado (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER)",
            }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const results = await Promise.all(DESTINATARIOS.map(async (To) => {
            const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`)}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ To, From: FROM, Body: message }),
            });
            const data = await r.json().catch(() => ({}));
            return { To, status: r.status, ok: r.ok, data };
        }));
        console.log(`[sms:${kind}] enviados:`, JSON.stringify(results));
        return new Response(JSON.stringify({ success: results.every((result) => result.ok), results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : "erro desconhecido";
        console.error("Erro send-sms-alert:", msg);
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
