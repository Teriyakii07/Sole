
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const token = authorization.replace("Bearer ", "");

    // Verify the signed-in user.
    const authClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: authorization },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Invalid user session." }, 401);
    }

    // This privileged client is only used inside the Edge Function.
    const admin = createClient(supabaseUrl, serviceKey);

    if (req.method === "GET") {
      const orderId = new URL(req.url).searchParams.get("orderId");

      if (!orderId) {
        return jsonResponse({ error: "Missing orderId." }, 400);
      }

      const { data: order, error: orderError } = await admin
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (orderError) throw orderError;

      if (!order) {
        return jsonResponse({ error: "Order not found." }, 404);
      }

      const [itemsResult, trackingResult] = await Promise.all([
        admin
          .from("order_items")
          .select("*")
          .eq("order_id", orderId),

        admin
          .from("order_tracking")
          .select("*")
          .eq("order_id", orderId)
          .maybeSingle(),
      ]);

      if (itemsResult.error) throw itemsResult.error;
      if (trackingResult.error) throw trackingResult.error;

      return jsonResponse({
        success: true,
        order,
        items: itemsResult.data ?? [],
        tracking: trackingResult.data,
      });
    }

    if (req.method === "POST") {
      const body = await req.json();

      const {
        orderId,
        storeLat,
        storeLng,
        destinationLat,
        destinationLng,
      } = body;

      if (
        !orderId ||
        !Number.isFinite(storeLat) ||
        !Number.isFinite(storeLng) ||
        !Number.isFinite(destinationLat) ||
        !Number.isFinite(destinationLng)
      ) {
        return jsonResponse(
          { error: "Order ID and valid coordinates are required." },
          400
        );
      }

      // Make sure this order belongs to the authenticated user.
      const { data: order, error: orderError } = await admin
        .from("orders")
        .select("id, user_id, status")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (orderError) throw orderError;

      if (!order) {
        return jsonResponse({ error: "Order not found." }, 404);
      }

      const { data, error } = await admin
        .from("order_tracking")
        .upsert(
          {
            order_id: orderId,
            store_lat: storeLat,
            store_lng: storeLng,
            destination_lat: destinationLat,
            destination_lng: destinationLng,
            delivery_status: "Preparing",
            progress_percent: 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "order_id" }
        )
        .select()
        .single();

      if (error) throw error;

      return jsonResponse({
        success: true,
        message: "Delivery tracking initialized.",
        tracking: data,
      });
    }

    return jsonResponse({ error: "Method not allowed." }, 405);
  } catch (error) {
    console.error("Delivery tracking error:", error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process delivery tracking.",
      },
      500
    );
  }
});
