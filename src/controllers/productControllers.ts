
import { supabase } from '../lib/supabaseClient';
import type { Product, HomeCategory } from '../models/Product';
import { getProductImageUrl } from './productImageController';

const FALLBACK_CATEGORY_IMAGE =
  '/images/products/puma-crimson-gum.png';

const categoryImages: Record<string, string> = {
  sneakers: '/images/products/puma-crimson-gum.png',
  oxford: '/images/products/oxford.png',
  'chelsea-boots': '/images/products/chelsea-boots.png',
  loafers: '/images/products/loafers.png',
  'running-shoes': '/images/products/running-shoes.png',
  espadrilles: '/images/products/espadrilles.png',
};

function getRelationName(relation: unknown): string {
  if (Array.isArray(relation)) {
    return relation[0]?.name?.trim() ?? '';
  }

  if (relation && typeof relation === 'object' && 'name' in relation) {
    const name = relation.name;
    return typeof name === 'string' ? name.trim() : '';
  }

  return '';
}

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
    image: categoryImages[category.slug] ?? FALLBACK_CATEGORY_IMAGE,
  }));
}

export async function getHomepageProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      brand_id,
      description,
      image_url,
      created_at,
      is_active,
      categories (
        id,
        name
      ),
      brands (
        id,
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

  const products: (Product | null)[] = (data ?? []).map((item): Product | null => {
    const availableVariants = (item.product_variants ?? []).filter(
      (variant) =>
        variant.is_active &&
        Number(variant.stock_quantity) > 0
    );

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
      brand: getRelationName(item.brands),
      price: lowestPrice,
      image: getProductImageUrl(item.image_url),
      category: getRelationName(item.categories),
      description: item.description ?? '',
      stockCount: totalStock,

      // Preserve the available shoe variants and their database IDs
      variants: availableVariants.map((variant) => ({
        id: variant.id,
        price: Number(variant.price),
        stockQuantity: Number(variant.stock_quantity),
        sizeLabel: variant.size_label,
        color: variant.color,
        isActive: variant.is_active,
      })),

      createdAt: item.created_at,
    };
  });

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
      brand_id,
      description,
      image_url,
      created_at,
      categories (
        id,
        name
      ),
      brands (
        id,
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
    brand: getRelationName(data.brands),
    price: lowestPrice,
    image: getProductImageUrl(data.image_url),
    category: getRelationName(data.categories),
    styleCode: firstVariant?.sku ?? '',
    color: firstVariant?.color ?? '',
    description: data.description ?? '',
    stockCount: totalStock,

    // Preserve the available shoe variants and their database IDs
    variants: availableVariants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: Number(variant.price),
      stockQuantity: Number(variant.stock_quantity),
      sizeLabel: variant.size_label,
      color: variant.color,
      isActive: variant.is_active,
    })),

    createdAt: data.created_at,
  };
}
