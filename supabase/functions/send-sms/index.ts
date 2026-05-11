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
    const { phone, name, orderId, amount } = await req.json();

    if (!phone || !name || !orderId || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize phone — strip +91 prefix if present, keep 10 digits
    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);

    if (cleanPhone.length !== 10) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FAST2SMS_KEY = Deno.env.get("FAST2SMS_API_KEY") ?? "";
    if (!FAST2SMS_KEY) {
      console.error("FAST2SMS_API_KEY secret is not set");
      return new Response(
        JSON.stringify({ success: false, error: "SMS service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Message text — keep under 160 chars for single SMS
    const message =
      `Dear ${name}, your Order #${orderId} for Rs.${amount} is confirmed! ` +
      `Thank you for shopping with Libas Collection, Solapur. ` +
      `We will deliver soon. - Libas Collection`;

    const smsPayload = new URLSearchParams({
      authorization: FAST2SMS_KEY,
      variables_values: message,
      route: "q",            // Quick / promotional route
      numbers: cleanPhone,
    });

    const smsRes = await fetch(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
        },
        body: smsPayload.toString(),
      }
    );

    const smsData = await smsRes.json();
    console.log("Fast2SMS response:", JSON.stringify(smsData));

    if (smsData.return === true) {
      return new Response(
        JSON.stringify({ success: true, message: "SMS sent", requestId: smsData.request_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error("Fast2SMS error:", smsData.message);
      return new Response(
        JSON.stringify({ success: false, error: smsData.message || "SMS delivery failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("send-sms exception:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
