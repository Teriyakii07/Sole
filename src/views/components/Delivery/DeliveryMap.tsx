
import { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import {
  getDeliveryTracking,
  getDeliveryRoute,
  initializeDeliveryTracking,
  geocodeDeliveryAddress,
} from "../../../controllers/deliveryTrackingController";
import { SOLE_STORE_ADDRESS } from "../../../config/delivery";
import type {
  DeliveryTrackingResponse,
} from "../../../models/DeliveryTracking";

maptilersdk.config.apiKey =
  import.meta.env.VITE_MAPTILER_API_KEY;

interface Props {
  orderId: string;
}

export default function DeliveryMap({ orderId }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);

  const [data, setData] =
    useState<DeliveryTrackingResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load delivery tracking information
    useEffect(() => {
    let cancelled = false;

    async function loadTracking() {
        try {
        setLoading(true);
        setError("");

        const result = await getDeliveryTracking(orderId);

        // Recover orders that do not have a tracking record yet.
        if (!result.tracking) {
            const storeLocation = await geocodeDeliveryAddress(
            SOLE_STORE_ADDRESS
            );

            const fullDeliveryAddress = [
            result.order.address_line,
            result.order.address_line_2,
            result.order.barangay,
            result.order.city,
            result.order.province,
            result.order.postal_code,
            result.order.country || "Philippines",
            ]
            .filter(Boolean)
            .join(", ");

            const destination = await geocodeDeliveryAddress(
            fullDeliveryAddress
            );

            await initializeDeliveryTracking(
            orderId,
            storeLocation,
            destination
            );

            const refreshedResult = await getDeliveryTracking(orderId);

            if (cancelled) return;

            setData(refreshedResult);
        } else {
            if (cancelled) return;

            setData(result);
        }
        } catch (err) {
        console.error("Delivery tracking error:", err);

        if (!cancelled) {
            setError(
            err instanceof Error
                ? err.message
                : "Unable to initialize delivery tracking."
            );
        }
        } finally {
        if (!cancelled) {
            setLoading(false);
        }
        }
    }

    loadTracking();

    return () => {
        cancelled = true;
    };
    }, [orderId]);

  useEffect(() => {
    if (!data?.tracking || !mapContainer.current) return;

    const currentTracking = data.tracking;

    let map: maptilersdk.Map | null = null;
    let cancelled = false;

    async function initializeMap() {
      try {
        const store = {
          lat: currentTracking.store_lat,
          lng: currentTracking.store_lng,
        };

        const destination = {
          lat: currentTracking.destination_lat,
          lng: currentTracking.destination_lng,
        };

        const route = await getDeliveryRoute(
          store,
          destination
        );

        if (cancelled || !mapContainer.current) return;

        map = new maptilersdk.Map({
          container: mapContainer.current,
          style: maptilersdk.MapStyle.STREETS,
          center: [store.lng, store.lat],
          zoom: 12,
        });

        map.on("load", () => {
          if (!map || cancelled) return;

          map.addSource("delivery-route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: route.geometry,
            },
          });

          map.addLayer({
            id: "delivery-route-line",
            type: "line",
            source: "delivery-route",
            paint: {
              "line-color": "#123A8C",
              "line-width": 5,
            },
          });

          new maptilersdk.Marker({
            color: "#123A8C",
          })
            .setLngLat([store.lng, store.lat])
            .setPopup(
              new maptilersdk.Popup().setText("SOLE Store")
            )
            .addTo(map);

          new maptilersdk.Marker({
            color: "#D7192D",
          })
            .setLngLat([destination.lng, destination.lat])
            .setPopup(
              new maptilersdk.Popup().setText(
                "Delivery Address"
              )
            )
            .addTo(map);

          const coordinates =
            route.geometry.coordinates as [number, number][];

          const bounds = new maptilersdk.LngLatBounds();

          coordinates.forEach((coordinate) => {
            bounds.extend(coordinate);
          });

          map.fitBounds(bounds, {
            padding: 55,
            maxZoom: 15,
          });
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to display the delivery map."
          );
        }
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [data]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading delivery information...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!data?.tracking) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <p className="font-semibold text-gray-800">
          Delivery map not available yet
        </p>

        <p className="mt-1 text-sm text-gray-500">
          The delivery address may not have been located when
          this order was placed.
        </p>
      </div>
    );
  }

  const tracking = data.tracking;

  return (
    <section className="mt-5 rounded-xl border border-gray-200 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-[#123A8C]">
            Delivery Tracking
          </h4>

          <p className="text-sm text-gray-500">
            SOLE Store → Your Delivery Address
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#123A8C]">
          {tracking.delivery_status}
        </span>
      </div>

      <div
        ref={mapContainer}
        className="h-[350px] w-full overflow-hidden rounded-lg"
      />

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-semibold text-gray-700">
            Delivery progress
          </span>

          <span className="font-bold text-[#123A8C]">
            {tracking.progress_percent}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#123A8C] transition-all"
            style={{
              width: `${tracking.progress_percent}%`,
            }}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        The map displays a calculated driving route. It does
        not show a live courier location.
      </p>
    </section>
  );
}
