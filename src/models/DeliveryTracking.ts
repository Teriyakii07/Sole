
export interface DeliveryCoordinates {
  lat: number;
  lng: number;
}

export interface DeliveryTracking {
  order_id: string;
  store_lat: number;
  store_lng: number;
  destination_lat: number;
  destination_lng: number;
  delivery_status: string;
  progress_percent: number;
  estimated_delivery: string | null;
  delivered_at: string | null;
}

export interface DeliveryOrderItem {
  id: string;
  order_id: string;
  product_name: string;
  size_label: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface DeliveryOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  recipient_name: string;
  recipient_phone: string;
  address_line: string;
  address_line_2: string | null;
  barangay: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export interface DeliveryTrackingResponse {
  success: boolean;
  order: DeliveryOrder;
  items: DeliveryOrderItem[];
  tracking: DeliveryTracking | null;
}
