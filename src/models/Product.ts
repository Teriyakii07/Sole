
export interface ProductVariant {
  id: string;
  sku?: string;
  price: number;
  stockQuantity: number;
  sizeLabel: string;
  color?: string;
  isActive: boolean;
}

export interface Product {
  id: string | number;
  name: string;
  brand?: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  styleCode?: string;
  color?: string;
  description?: string;
  stockCount?: number;
  galleryImages?: string[];
  createdAt?: string;
  variants?: ProductVariant[];
}

export interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
}
