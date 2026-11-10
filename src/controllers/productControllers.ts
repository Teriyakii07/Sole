
import { supabase } from '../lib/supabaseClient';
import type { Product, HomeCategory } from '../models/Product';
import { getProductImageUrl } from './productImageController';

const FALLBACK_CATEGORY_IMAGE =
  '/images/products/puma-crimson-gum.png';

// Categories do not currently have an image_url column.
// Keep these local category images until category images
// are added to Supabase.
const categoryImages: Record<string, string> = {
  sneakers: '/images/products/puma-crimson-gum.png',
  oxford: '/images/products/oxford.png',
  'chelsea-boots': '/images/products/chelsea-boots.png',
  loafers: '/images/products/loafers.png',
  'running-shoes': '/images/products/running-shoes.png',
  espadrilles: '/images/products/espadrilles.png',
};

export async function getHomepageCategories(): Promise<HomeCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Unable to load categories: ${error.message}`);
  }

  return (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    image:
      categoryImages[category.slug] ??
      FALLBACK_CATEGORY_IMAGE,
  }));
}

export async function getHomepageProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      image_url,
      created_at,
      is_active,
      categories (
        name
      ),
      product_variants (
        id,
        price,
        stock_quantity,
        size_label,
        color,
        is_active
      )
    `)
    .eq('is_active', true)
    .eq('product_variants.is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Unable to load products: ${error.message}`);
  }

  const products: (Product | null)[] = (data ?? []).map(
    (item): Product | null => {
      const availableVariants = (item.product_variants ?? []).filter(
        (variant) =>
          variant.is_active &&
          Number(variant.stock_quantity) > 0
      );

      // Exclude products without available stock.
      if (availableVariants.length === 0) {
        return null;
      }

      const prices = availableVariants.map((variant) =>
        Number(variant.price)
      );

      const lowestPrice = Math.min(...prices);

      const totalStock = availableVariants.reduce(
        (total, variant) =>
          total + Number(variant.stock_quantity),
        0
      );

      return {
        id: item.id,
        name: item.name,
        price: lowestPrice,

        // Convert the Supabase Storage path into a public URL.
        image: getProductImageUrl(item.image_url),

        category: item.categories?.[0]?.name ?? '',
        isNew: true,
        description: item.description ?? '',
        stockCount: totalStock,
      };
    }
  );

  return products.filter(
    (product): product is Product => product !== null
  );
}

export async function getProductById(
  id: string
): Promise<Product | null> {
  if (!id) {
    return null;
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      image_url,
      categories (
        name
      ),
      product_variants (
        id,
        sku,
        price,
        stock_quantity,
        size_label,
        color,
        is_active
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .eq('product_variants.is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load product: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const availableVariants = (data.product_variants ?? []).filter(
    (variant) => variant.is_active
  );

  if (availableVariants.length === 0) {
    return null;
  }

  const lowestPrice = Math.min(
    ...availableVariants.map((variant) => Number(variant.price))
  );

  const totalStock = availableVariants.reduce(
    (total, variant) =>
      total + Number(variant.stock_quantity),
    0
  );

  const firstVariant = availableVariants[0];

  return {
    id: data.id,
    name: data.name,
    price: lowestPrice,

    // Convert the Supabase Storage path into a public URL.
    image: getProductImageUrl(data.image_url),

    category: data.categories?.[0]?.name ?? '',
    styleCode: firstVariant?.sku ?? '',
    color: firstVariant?.color ?? '',
    description: data.description ?? '',
    stockCount: totalStock,
  };
}
