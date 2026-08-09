export default {
  async fetch(request) {
    // Responder a la verificación previa del navegador (preflight)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Método no permitido", { status: 405 });
    }

    const TELEGRAM_BOT_TOKEN = "8860861622:AAHF01y1xuvOJXzHyVeaWG7DIfwBsbLay8g";
    const TELEGRAM_CHAT_ID = "5329085044";

    try {
      const body = await request.json();

      const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: body.text })
      });

      const result = await tgRes.json();

      return new Response(JSON.stringify(result), {
        status: tgRes.ok ? 200 : 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: String(err) }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
