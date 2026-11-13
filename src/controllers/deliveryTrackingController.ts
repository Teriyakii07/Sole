
import { supabase } from "../lib/supabaseClient";

import type {
  DeliveryCoordinates,
  DeliveryTrackingResponse,
} from "../models/DeliveryTracking";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

const TRACKING_URL =
  `${SUPABASE_URL}/functions/v1/delivery-tracking`;

// GET: retrieve order and tracking information.
export async function getDeliveryTracking(
  orderId: string
): Promise<DeliveryTrackingResponse> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  if (!session) throw new Error("Please log in to view this order.");

  const response = await fetch(
    `${TRACKING_URL}?orderId=${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Unable to retrieve tracking.");
  }

  return result as DeliveryTrackingResponse;
}

export async function geocodeDeliveryAddress(
  address: string
): Promise<{ lat: number; lng: number }> {
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

  if (!apiKey) {
    throw new Error("Missing MapTiler API key.");
  }

  // Avoid adding Philippines twice.
  const cleanAddress = address
    .replace(/,\s*Philippines/gi, "")
    .trim();

  const searchAddress = `${cleanAddress}, Philippines`;

  const url = new URL(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(searchAddress)}.json`
  );

  url.searchParams.set("country", "PH");
  url.searchParams.set("limit", "1");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("MapTiler API response:", response.status, responseBody);

    if (response.status === 403) {
      throw new Error(
        "MapTiler rejected the API key. Check that the key is active and allows localhost."
      );
    }

    throw new Error(
      responseBody?.message ||
        `MapTiler geocoding failed with status ${response.status}.`
    );
  }

  if (!responseBody?.features?.length) {
    throw new Error(
      `MapTiler could not find this address: ${searchAddress}`
    );
  }

  const [lng, lat] = responseBody.features[0].center;

  return { lat, lng };
}

export async function initializeDeliveryTracking(
  orderId: string,
  store: DeliveryCoordinates,
  destination: DeliveryCoordinates
) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  if (!session) throw new Error("Please log in before tracking an order.");

  const response = await fetch(TRACKING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      orderId,
      storeLat: store.lat,
      storeLng: store.lng,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Unable to initialize tracking.");
  }

  return result;
}

export async function getDeliveryRoute(
  store: DeliveryCoordinates,
  destination: DeliveryCoordinates
) {
  const coordinates =
    `${store.lng},${store.lat};${destination.lng},${destination.lat}`;

  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
  );

  if (!response.ok) {
    throw new Error("Unable to calculate the delivery route.");
  }

  const result = await response.json();

  if (result.code !== "Ok" || !result.routes?.length) {
    throw new Error("No driving route was found.");
  }

  return result.routes[0];
}
