
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
}

export interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
}
