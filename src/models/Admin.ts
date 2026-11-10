
export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;

  brand?: {
    id: string;
    name: string;
  };

  category?: {
    id: string;
    name: string;
  };

  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size_label: string;
  size_system: string;
  color: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  brand_id: string;
  category_id: string;
  description: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
}

export interface VariantFormData {
  size_label: string;
  size_system: string;
  color: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  is_active: boolean;
}

export interface DashboardOrder {
  id: number;
  customer: string;
  product: string;
  amount: number;
  status: 'Paid' | 'Shipped' | 'Processing' | 'Pending';
}

export interface DashboardProduct {
  id: number;
  name: string;
  units: number;
  revenue: number;
}

