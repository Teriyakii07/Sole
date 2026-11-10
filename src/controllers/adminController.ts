
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { uploadProductImage } from './productImageController';


import type {
  AdminBrand,
  AdminCategory,
  Product,
  ProductFormData,
  ProductVariant,
  VariantFormData,
  DashboardOrder,
  DashboardProduct,
} from '../models/Admin';

type NameDescriptionInput = {
  name: string;
  description: string;
};

const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const generateSKU = () => {
  const identifier = crypto.randomUUID()
    .replace(/-/g, '')
    .slice(0, 12)
    .toUpperCase();

  return `SOLE-${identifier}`;
};

export function useAdminController() {
  // Dashboard demo data
  const stats = [
    { title: 'TOTAL REVENUE', value: '₱47,383', change: 'Vs previous period' },
    { title: 'TOTAL ORDERS', value: '200', change: 'Vs previous period' },
    { title: 'ACTIVE CUSTOMERS', value: '13', change: 'Vs previous period' },
    { title: 'UNITS SOLD', value: '110', change: 'Vs previous period' },
  ];

  const revenueData = [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 100 },
    { month: 'Mar', value: 75 },
    { month: 'Apr', value: 105 },
    { month: 'May', value: 48 },
    { month: 'Jun', value: 85 },
  ];

  const salesStatus = [
    { label: 'Delivered', value: 52.1 },
    { label: 'Shipped', value: 22.8 },
    { label: 'Processing', value: 13.9 },
    { label: 'Pending', value: 11.2 },
  ];

  const products: DashboardProduct[] = [
    { id: 1, name: 'Air Jordan Legacy', units: 186, revenue: 942 },
    { id: 2, name: 'Air Zoom Pulse', units: 142, revenue: 881 },
    { id: 3, name: 'Air Jordan Flow', units: 118, revenue: 409 },
    { id: 4, name: 'Superstar Street', units: 97, revenue: 953 },
    { id: 5, name: 'Messi', units: 87, revenue: 907 },
  ];

  const orders: DashboardOrder[] = [
    { id: 10234, customer: 'Jether Aguatani', product: 'Air Jordan Legacy x1', amount: 7383, status: 'Paid' },
    { id: 10235, customer: 'Jether Aguatani', product: 'Air Zoom Pulse x1', amount: 2383, status: 'Shipped' },
    { id: 10236, customer: 'Jether Aguatani', product: 'Air Jordan Flow x1', amount: 3383, status: 'Processing' },
    { id: 10237, customer: 'Jether Aguatani', product: 'Superstar Street x1', amount: 1383, status: 'Paid' },
    { id: 10238, customer: 'Jether Aguatani', product: 'Messi x1', amount: 2383, status: 'Paid' },
  ];

  // Product management state
  const [productList, setProductList] = useState<Product[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productError, setProductError] = useState('');
  const [productMessage, setProductMessage] = useState('');

  // Shared error handler
  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  // Load products, brands, categories, and variants
  const loadProductData = useCallback(async () => {
    setIsLoadingProducts(true);
    setProductError('');

    try {
      const [
        productsResult,
        brandsResult,
        categoriesResult,
        variantsResult,
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name'),

        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name'),

        supabase
          .from('product_variants')
          .select('*')
          .order('size_label'),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (brandsResult.error) throw brandsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (variantsResult.error) throw variantsResult.error;

      const loadedBrands = (brandsResult.data ?? []) as AdminBrand[];
      const loadedCategories = (categoriesResult.data ?? []) as AdminCategory[];
      const loadedVariants = (variantsResult.data ?? []) as ProductVariant[];

      const loadedProducts = (productsResult.data ?? []).map((product) => ({
        ...product,
        brand: loadedBrands.find((brand) => brand.id === product.brand_id),
        category: loadedCategories.find(
          (category) => category.id === product.category_id
        ),
        variants: loadedVariants.filter(
          (variant) => variant.product_id === product.id
        ),
      })) as Product[];

      setProductList(loadedProducts);
      setBrands(loadedBrands);
      setCategories(loadedCategories);
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to load products.'));
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void loadProductData();
  }, [loadProductData]);


const createProduct = async (
  productData: ProductFormData,
  variantData: VariantFormData,
  imageFile: File
): Promise<boolean> => {
  setIsSavingProduct(true);
  setProductError('');
  setProductMessage('');

  let currentStep = 'Validating product information';
  try {
    if (!imageFile) {
      throw new Error('Please upload a product image.');
    }

    if (
      !productData.name.trim() ||
      !productData.brand_id ||
      !productData.category_id
    ) {
      throw new Error('Please complete all required product fields.');
    }

    if (
      !variantData.size_label.trim() ||
      !variantData.color.trim()
    ) {
      throw new Error('Variant size and color are required.');
    }

    if (
      variantData.price < 0 ||
      variantData.stock_quantity < 0 ||
      (variantData.compare_at_price !== null &&
        variantData.compare_at_price < 0)
    ) {
      throw new Error('Price and stock cannot be negative.');
    }

   // 1. Create the product.
currentStep = 'Creating product record';

const { data: product, error: productInsertError } =
  await supabase
    .from('products')
    .insert({
      name: productData.name.trim(),
      slug: makeSlug(productData.name),
      brand_id: productData.brand_id,
      category_id: productData.category_id,
      description: productData.description,
      image_url: null,
      is_active: productData.is_active,
      is_featured: productData.is_featured,
    })
    .select()
    .single();

if (productInsertError) throw productInsertError;

    // 2. Generate the first variant's SKU.
    const sku = generateSKU();

    // 3. Create the first product variant.
    const { data: variant, error: variantInsertError } =
      await supabase
        .from('product_variants')
        .insert({
          product_id: product.id,
          sku,
          size_label: variantData.size_label.trim(),
          size_system: variantData.size_system,
          color: variantData.color.trim(),
          price: variantData.price,
          compare_at_price: variantData.compare_at_price,
          stock_quantity: variantData.stock_quantity,
          is_active: variantData.is_active,
        })
        .select()
        .single();

    if (variantInsertError) throw variantInsertError;

    // 4. Upload the product image using the first variant's SKU.
    const imagePath = await uploadProductImage(sku, imageFile);

    // 5. Save the image path in the products table.
    const { error: imageUpdateError } = await supabase
      .from('products')
      .update({
        image_url: imagePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id);

    if (imageUpdateError) throw imageUpdateError;

    // 6. Record the initial stock movement.
    if (variantData.stock_quantity > 0) {
      const { data: userData } = await supabase.auth.getUser();

      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          variant_id: variant.id,
          movement_type: 'stock_in',
          quantity: variantData.stock_quantity,
          reference_number: `INITIAL-${variant.id.slice(0, 8)}`,
          notes: 'Initial product stock.',
          created_by: userData.user?.id ?? null,
        });

      if (movementError) throw movementError;
    }

    setProductMessage('Product created successfully.');

    await loadProductData();

    return true;
 } catch (error) {
  console.error('CREATE PRODUCT FAILED');
  console.error('Failed at:', currentStep);
  console.error('Full error:', error);

  if (error && typeof error === 'object') {
    const dbError = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };

    console.error('Error details:', {
      message: dbError.message,
      code: dbError.code,
      details: dbError.details,
      hint: dbError.hint,
    });

    setProductError(
      `${currentStep}: ${dbError.message ?? 'Unknown database error'}`
    );
  } else {
    setProductError(
      getErrorMessage(error, 'Failed to create product.')
    );
  }

  return false;
} finally {
  setIsSavingProduct(false);
}
};


const updateProduct = async (
  id: string,
  productData: ProductFormData,
  imageFile: File | null
): Promise<boolean> => {
  setIsSavingProduct(true);
  setProductError('');
  setProductMessage('');

  try {
    if (!productData.name.trim()) {
      throw new Error('Product name is required.');
    }

    let imagePath = productData.image_url || null;

    // Only upload a new image if the user selected one.
    if (imageFile) {
      // Find the first variant's SKU.
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('sku')
        .eq('product_id', id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (variantError) throw variantError;

      if (!variant?.sku) {
        throw new Error(
          'Cannot replace the product image because no variant SKU was found.'
        );
      }

      // Replace the image using the same SKU.
      imagePath = await uploadProductImage(variant.sku, imageFile);
    }

    // Update the product information.
    const { error: updateError } = await supabase
      .from('products')
      .update({
        name: productData.name.trim(),
        slug: makeSlug(productData.name),
        brand_id: productData.brand_id,
        category_id: productData.category_id,
        description: productData.description,
        image_url: imagePath,
        is_active: productData.is_active,
        is_featured: productData.is_featured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;

    setProductMessage('Product updated successfully.');

    await loadProductData();

    return true;
  } catch (error) {
    setProductError(
      getErrorMessage(error, 'Failed to update product.')
    );

    return false;
  } finally {
    setIsSavingProduct(false);
  }
};


  // Add a new variant to an existing product
  const addProductVariant = async (
    productId: string,
    variantData: VariantFormData
  ) => {
    setIsSavingProduct(true);
    setProductError('');
    setProductMessage('');

    try {
      if (!variantData.size_label.trim() || !variantData.color.trim()) {
        throw new Error('Variant size and color are required.');
      }

      if (variantData.price < 0 || variantData.stock_quantity < 0) {
        throw new Error('Price and stock cannot be negative.');
      }

      // Verify that the parent product exists
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const generatedSKU = generateSKU();

      const { data: variant, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: product.id,
          sku: generatedSKU,
          size_label: variantData.size_label.trim(),
          size_system: variantData.size_system,
          color: variantData.color.trim(),
          price: variantData.price,
          compare_at_price: variantData.compare_at_price,
          stock_quantity: variantData.stock_quantity,
          is_active: variantData.is_active,
        })
        .select()
        .single();

      if (error) throw error;

      // Record initial stock
      if (variantData.stock_quantity > 0) {
        const { data: userData } = await supabase.auth.getUser();

        const { error: movementError } = await supabase
          .from('inventory_movements')
          .insert({
            variant_id: variant.id,
            movement_type: 'stock_in',
            quantity: variantData.stock_quantity,
            reference_number: `INITIAL-${variant.id.slice(0, 8)}`,
            notes: 'Initial stock for new product variant.',
            created_by: userData.user?.id ?? null,
          });

        if (movementError) throw movementError;
      }

      setProductMessage(`Variant added successfully. SKU: ${generatedSKU}`);

      await loadProductData();
      return true;
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to add variant.'));
      return false;
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Update variant details and record stock adjustments
  const updateProductVariant = async (
    variant: ProductVariant,
    variantData: VariantFormData
  ) => {
    setIsSavingProduct(true);
    setProductError('');
    setProductMessage('');

    try {
      if (!variantData.size_label.trim() || !variantData.color.trim()) {
        throw new Error('Variant size and color are required.');
      }

      if (
        variantData.price < 0 ||
        variantData.stock_quantity < 0 ||
        (variantData.compare_at_price !== null &&
          variantData.compare_at_price < 0)
      ) {
        throw new Error('Price and stock cannot be negative.');
      }

      const difference =
        variantData.stock_quantity - variant.stock_quantity;

      const { error } = await supabase
        .from('product_variants')
        .update({
          size_label: variantData.size_label.trim(),
          size_system: variantData.size_system,
          color: variantData.color.trim(),
          price: variantData.price,
          compare_at_price: variantData.compare_at_price,
          stock_quantity: variantData.stock_quantity,
          is_active: variantData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', variant.id);

      if (error) throw error;

      // Record the stock difference
      if (difference !== 0) {
        const { data: userData } = await supabase.auth.getUser();

        const { error: movementError } = await supabase
          .from('inventory_movements')
          .insert({
            variant_id: variant.id,
            movement_type: difference > 0 ? 'stock_in' : 'stock_out',
            quantity: Math.abs(difference),
            reference_number: `ADJUST-${variant.id.slice(0, 8)}-${Date.now()}`,
            notes:
              difference > 0
                ? 'Additional stock added through admin product management.'
                : 'Stock removed through admin product management.',
            created_by: userData.user?.id ?? null,
          });

        if (movementError) throw movementError;
      }

      setProductMessage(
        difference === 0
          ? 'Variant updated successfully.'
          : `Variant updated successfully. Stock ${
              difference > 0 ? 'increased by' : 'decreased by'
            } ${Math.abs(difference)}.`
      );

      await loadProductData();
      return true;
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to update variant.'));
      return false;
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Deactivate product instead of permanently deleting it
  const deleteProduct = async (productId: string) => {
    setProductError('');
    setProductMessage('');

    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (error) throw error;

      setProductMessage('Product deactivated successfully.');
      await loadProductData();
      return true;
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to deactivate product.'));
      return false;
    }
  };

  // Deactivate an individual variant
  const deactivateProductVariant = async (variantId: string) => {
    setProductError('');
    setProductMessage('');

    try {
      const { error } = await supabase
        .from('product_variants')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', variantId);

      if (error) throw error;

      setProductMessage('Variant deactivated successfully.');
      await loadProductData();
      return true;
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to deactivate variant.'));
      return false;
    }
  };

  // Create brand
  const createBrand = async (input: NameDescriptionInput) => {
    setProductError('');
    setProductMessage('');

    try {
      const name = input.name.trim();

      if (!name) throw new Error('Brand name is required.');

      const { error } = await supabase
        .from('brands')
        .insert({
          name,
          slug: makeSlug(name),
          description: input.description.trim() || null,
          logo_url: null,
          is_active: true,
        });

      if (error) throw error;

      setProductMessage('Brand created successfully.');
      await loadProductData();
      return true;
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to create brand.'));
      return false;
    }
  };

  // Update brand
  const updateBrand = async (
    brandId: string,
    input: NameDescriptionInput
  ) => {
    setProductError('');
    setProductMessage('');

    try {
      const name = input.name.trim();

      if (!name) throw new Error('Brand name is required.');

      const { error } = await supabase
        .from('brands')
        .update({
          name,
          slug: makeSlug(name),
          description: input.description.trim() || null,
        })
        .eq('id', brandId);

      if (error) throw error;

      setProductMessage('Brand updated successfully.');
      await loadProductData();
      return true;
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to update brand.'));
      return false;
    }
  };

  // Deactivate brand
  const deactivateBrand = async (brandId: string) => {
    setProductError('');
    setProductMessage('');

    try {
      const { error } = await supabase
        .from('brands')
        .update({ is_active: false })
        .eq('id', brandId);

      if (error) throw error;

      setProductMessage('Brand deactivated successfully.');
      await loadProductData();
      return true;
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to deactivate brand.'));
      return false;
    }
  };

  // Create category
  const createCategory = async (input: NameDescriptionInput) => {
    setProductError('');
    setProductMessage('');

    try {
      const name = input.name.trim();

      if (!name) throw new Error('Category name is required.');

      const { error } = await supabase
        .from('categories')
        .insert({
          name,
          slug: makeSlug(name),
          description: input.description.trim() || null,
          is_active: true,
        });

      if (error) throw error;

      setProductMessage('Category created successfully.');
      await loadProductData();
      return true;
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to create category.'));
      return false;
    }
  };

  // Update category
  const updateCategory = async (
    categoryId: string,
    input: NameDescriptionInput
  ) => {
    setProductError('');
    setProductMessage('');

    try {
      const name = input.name.trim();

      if (!name) throw new Error('Category name is required.');

      const { error } = await supabase
        .from('categories')
        .update({
          name,
          slug: makeSlug(name),
          description: input.description.trim() || null,
        })
        .eq('id', categoryId);

      if (error) throw error;

      setProductMessage('Category updated successfully.');
      await loadProductData();
      return true;
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to update category.'));
      return false;
    }
  };

  // Deactivate category
  const deactivateCategory = async (categoryId: string) => {
    setProductError('');
    setProductMessage('');

    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', categoryId);

      if (error) throw error;

      setProductMessage('Category deactivated successfully.');
      await loadProductData();
      return true;
    } catch (error) {
      setProductError(getErrorMessage(error, 'Unable to deactivate category.'));
      return false;
    }
  };

  return {
    // Dashboard
    stats,
    revenueData,
    salesStatus,
    products,
    orders,

    // Product management state
    productList,
    brands,
    categories,
    isLoadingProducts,
    isSavingProduct,
    productError,
    productMessage,

    // Product and variant actions
    loadProductData,
    createProduct,
    updateProduct,
    addProductVariant,
    updateProductVariant,
    deleteProduct,
    deactivateProductVariant,

    // Brand and category actions
    createBrand,
    updateBrand,
    deactivateBrand,
    createCategory,
    updateCategory,
    deactivateCategory,
  };
}
