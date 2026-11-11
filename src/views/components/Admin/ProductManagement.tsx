import { useState, useEffect, type FormEvent } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Package,
  Loader2,
} from 'lucide-react';

import type {
  Product,
  ProductFormData,
  ProductVariant,
  VariantFormData,
} from '../../../models/Admin';
import { getProductImageUrl } from '../../../controllers/productImageController';
import { handleImageError } from '../../../lib/imageFallback';

type Props = {
  products: Product[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  loading: boolean;
  saving: boolean;
  error: string;
  message: string;
onCreate: (
  product: ProductFormData,
  variant: VariantFormData,
  imageFile: File
) => Promise<boolean>;

onUpdate: (
  id: string,
  product: ProductFormData,
  imageFile: File | null
) => Promise<boolean>;
  onAddVariant: (id: string, variant: VariantFormData) => Promise<boolean>;
  onUpdateVariant: (variant: ProductVariant, data: VariantFormData) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onCreateBrand: (input: {
    name: string;
    description: string;
    }) => Promise<boolean>;

    onCreateCategory: (input: {
    name: string;
    description: string;
    }) => Promise<boolean>;
};


const emptyProduct: ProductFormData = {
  name: '',
  brand_id: '',
  category_id: '',
  description: '',
  image_url: '',
  is_active: true,
  is_featured: false,
};

const emptyVariant: VariantFormData = {
  size_label: '',
  size_system: 'EU',
  color: '',
  price: 0,
  compare_at_price: null,
  stock_quantity: 0,
  is_active: true,
};

export default function ProductManagement({
  products,
  brands,
  categories,
  loading,
  saving,
  error,
  message,
  onCreate,
  onUpdate,
  onAddVariant,
  onUpdateVariant,
  onDelete,
  onCreateBrand,
  onCreateCategory,
}: Props) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(emptyProduct);
  const [variantForm, setVariantForm] = useState<VariantFormData>(emptyVariant);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'variant'>('create');
  const [showMasterForm, setShowMasterForm] = useState<
    'brand' | 'category' | null
    >(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

    const [masterName, setMasterName] = useState('');
    const [masterDescription, setMasterDescription] = useState('');
    const [isSavingMaster, setIsSavingMaster] = useState(false);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingProduct(null);
    setSelectedVariant(null);
    setProductForm(emptyProduct);
    setVariantForm(emptyVariant);
    setImageFile(null);
    setFormMode('create');
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedVariant(null);
    setImageFile(null);

    setProductForm({
      name: product.name,
      brand_id: product.brand_id ?? '',
      category_id: product.category_id ?? '',
      description: product.description ?? '',
      image_url: product.image_url ?? '',
      is_active: product.is_active,
      is_featured: product.is_featured,
    });

    setFormMode('edit');
    setShowForm(true);
  };

  const openAddVariant = (product: Product) => {
    setEditingProduct(product);
    setSelectedVariant(null);
    setVariantForm(emptyVariant);
    setFormMode('variant');
    setShowForm(true);
    setImageFile(null);
  };

const openEditVariant = (
  product: Product,
  variant: ProductVariant
) => {
  setEditingProduct(product);
  setSelectedVariant(variant);

  setVariantForm({
    size_label: variant.size_label,
    size_system: variant.size_system,
    color: variant.color,
    price: Number(variant.price),
    compare_at_price:
      variant.compare_at_price === null
        ? null
        : Number(variant.compare_at_price),
    stock_quantity: variant.stock_quantity,
    is_active: variant.is_active,
  });

  setImageFile(null);
  setFormMode('variant');
  setShowForm(true);
};

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setSelectedVariant(null);
    setImageFile(null);
  };

const handleSubmit = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  let success = false;

  if (formMode === 'create') {
    if (!imageFile) {
      alert('Please upload a product image.');
      return;
    }

    success = await onCreate(
      productForm,
      variantForm,
      imageFile
    );
  } else if (formMode === 'edit' && editingProduct) {
    success = await onUpdate(
      editingProduct.id,
      productForm,
      imageFile
    );
  } else if (formMode === 'variant' && editingProduct) {
    success = selectedVariant
      ? await onUpdateVariant(selectedVariant, variantForm)
      : await onAddVariant(editingProduct.id, variantForm);
  }

  if (success) {
    closeForm();
  }
};

  const handleMasterSubmit = async (
    event: FormEvent<HTMLFormElement>
    ) => {
    event.preventDefault();

    setIsSavingMaster(true);

    try {
        const input = {
        name: masterName,
        description: masterDescription,
        };

        const success =
        showMasterForm === 'brand'
            ? await onCreateBrand(input)
            : showMasterForm === 'category'
            ? await onCreateCategory(input)
            : false;

        if (success) {
        setMasterName('');
        setMasterDescription('');
        setShowMasterForm(null);
        }
    } finally {
        setIsSavingMaster(false);
    }
    };

  const formatPrice = (price: number) =>
    `₱${Number(price).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  useEffect(() => {
  if (!imageFile) {
    setImagePreview('');
    return;
  }

  const previewUrl = URL.createObjectURL(imageFile);
  setImagePreview(previewUrl);

  return () => {
    URL.revokeObjectURL(previewUrl);
  };
}, [imageFile]);

    

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#123A8C] focus:ring-1 focus:ring-[#123A8C]';

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123A8C]">
            Product Management
            <span className="text-[#D7192D]">.</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Encode, update, and manage your shoe products and variants.
          </p>
        </div>

        
{/* Brand and Category Management */}
<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">

  {/* Brands */}
  <div>
    <button
      onClick={() => {
        setShowMasterForm('brand');
        setMasterName('');
        setMasterDescription('');
      }}
      className="mt-4 flex items-center gap-2 rounded-lg bg-[#123A8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d2d6d]"
    >
      <Plus size={16} />
      Add Brand
    </button>
  </div>

  {/* Categories */}
  <div>
    <button
      onClick={() => {
        setShowMasterForm('category');
        setMasterName('');
        setMasterDescription('');
      }}
      className="mt-4 flex items-center gap-2 rounded-lg bg-[#D7192D] px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
    >
      <Plus size={16} />
      Add Category
    </button>
  </div>
</div>

{/* Create Brand / Category Modal */}
{showMasterForm && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
    <form
      onSubmit={handleMasterSubmit}
      className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#123A8C]">
          Add New {showMasterForm === 'brand' ? 'Brand' : 'Category'}
        </h2>

        <button
          type="button"
          onClick={() => setShowMasterForm(null)}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        Name *
      </label>

      <input
        required
        value={masterName}
        onChange={(event) => setMasterName(event.target.value)}
        placeholder={
          showMasterForm === 'brand'
            ? 'e.g. Nike'
            : 'e.g. Running Shoes'
        }
        className={inputClass}
      />

      <label className="mb-1.5 mt-4 block text-sm font-semibold text-gray-700">
        Description
      </label>

      <textarea
        rows={3}
        value={masterDescription}
        onChange={(event) => setMasterDescription(event.target.value)}
        placeholder="Enter a short description..."
        className={inputClass}
      />

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowMasterForm(null)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSavingMaster}
          className="rounded-lg bg-[#123A8C] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSavingMaster ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  </div>
)}


        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#123A8C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2d6d]"
        >
          <Plus size={18} />
          Add New Shoe
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-5 flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <Search size={18} className="text-gray-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search shoe products..."
          className="w-full text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="font-semibold text-gray-700">No products found</p>
            <p className="mt-1 text-sm text-gray-400">
              Add a new shoe or try another search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Brand</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Variants</th>
                  <th className="px-5 py-4">Total Stock</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const variants = product.variants ?? [];
                  const totalStock = variants.reduce(
                    (total, variant) =>
                      total + (variant.is_active ? variant.stock_quantity : 0),
                    0
                  );

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImageUrl(product.image_url)}
                            alt={product.name}
                            onError={handleImageError}
                            className="h-14 w-14 rounded-lg border border-gray-200 bg-gray-50 object-contain p-1"
                          />

                          <div>
                            <p className="font-semibold text-gray-800">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {product.is_featured
                                ? 'Featured product'
                                : 'Regular product'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {product.brand?.name ?? '—'}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {product.category?.name ?? '—'}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {variants.length}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-700">
                        {totalStock}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.is_active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            title="Edit product"
                            className="rounded-lg p-2 text-[#123A8C] hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => openAddVariant(product)}
                            title="Add size or color"
                            className="rounded-lg p-2 text-green-700 hover:bg-green-50"
                          >
                            <Plus size={18} />
                          </button>

                          <button
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `Deactivate "${product.name}"? It will no longer be available as an active product.`
                                )
                              ) {
                                await onDelete(product.id);
                              }
                            }}
                            title="Deactivate product"
                            className="rounded-lg p-2 text-[#D7192D] hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                        {variants.length > 0 && (
                          <div className="mt-2 flex flex-wrap justify-end gap-1">
                            {variants.map((variant) => (
                              <button
                                key={variant.id}
                                onClick={() => openEditVariant(product, variant)}
                                title={`Edit ${variant.size_label} / ${variant.color}`}
                                className="rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-600 hover:bg-blue-50 hover:text-[#123A8C]"
                              >
                                {variant.size_label} · {variant.color}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#123A8C]">
                  {formMode === 'create'
                    ? 'Encode New Shoe'
                    : formMode === 'edit'
                      ? 'Edit Product'
                      : selectedVariant
                        ? 'Edit Shoe Variant'
                        : 'Add Shoe Variant'}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  {formMode === 'variant'
                    ? editingProduct?.name
                    : 'Enter the product information below.'}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {formMode !== 'variant' ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Shoe Name *
                    </label>
                    <input
                      required
                      value={productForm.name}
                      onChange={(event) =>
                        setProductForm({ ...productForm, name: event.target.value })
                      }
                      placeholder="e.g. Air Jordan 1 Retro High"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                        Brand *
                      </label>
                      <select
                        required
                        value={productForm.brand_id}
                        onChange={(event) =>
                          setProductForm({ ...productForm, brand_id: event.target.value })
                        }
                        className={inputClass}
                      >
                        <option value="">Select brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                        Category *
                      </label>
                      <select
                        required
                        value={productForm.category_id}
                        onChange={(event) =>
                          setProductForm({ ...productForm, category_id: event.target.value })
                        }
                        className={inputClass}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          description: event.target.value,
                        })
                      }
                      placeholder="Describe the shoe..."
                      className={inputClass}
                    />
                  </div>

{/* Product Image Upload */}
<div>
  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
    Product Image *
  </label>

  <input
    type="file"
    accept=".png,.jpg,.jpeg,.jpe,.webp,.gif,.avif,image/png,image/jpeg,image/webp,image/gif,image/avif"
    required={formMode === 'create'}
    onChange={(event) => {
      const file = event.target.files?.[0] ?? null;

      if (!file) {
        setImageFile(null);
        return;
      }

      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/gif',
        'image/avif',
        'image/jpe',
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid PNG, JPG, WEBP, GIF, or AVIF image.');
        event.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must not exceed 5 MB.');
        event.target.value = '';
        return;
      }

      setImageFile(file);
    }}
    className={inputClass}
  />

  <p className="mt-1 text-xs text-gray-400">
    Accepted formats: PNG, JPG, JPEG, WEBP, GIF, AVIF. Maximum size: 5 MB.
  </p>

  {(imagePreview || productForm.image_url) && (
    <div className="mt-3">
      <p className="mb-2 text-xs font-medium text-gray-500">
        {imageFile ? 'New image preview' : 'Current product image'}
      </p>

      <img
        src={
          imagePreview ||
          (productForm.image_url
            ? getProductImageUrl(productForm.image_url)
            : '')
        }
        alt="Product preview"
        className="h-40 w-40 rounded-lg border border-gray-200 bg-gray-50 object-contain p-2"
        onError={handleImageError}
      />
    </div>
  )}
</div>

                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={productForm.is_active}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            is_active: event.target.checked,
                          })
                        }
                        className="accent-[#123A8C]"
                      />
                      Active product
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={productForm.is_featured}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            is_featured: event.target.checked,
                          })
                        }
                        className="accent-[#123A8C]"
                      />
                      Featured product
                    </label>
                  </div>
                </>
              ) : null}

              {formMode !== 'edit' && (
                <>
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="mb-4 font-bold text-gray-800">
                      {formMode === 'create' ? 'First Shoe Variant' : 'Variant Details'}
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                            SKU
                        </label>

                        <input
                            type="text"
                            value={
                            selectedVariant?.sku ??
                            'Automatically generated when saved'
                            }
                            readOnly
                            className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-500`}
                        />

                        <p className="mt-1 text-xs text-gray-400">
                            {selectedVariant
                            ? 'Existing SKU. This will not change when editing the variant.'
                            : 'The system will automatically generate a unique SKU.'}
                        </p>
                        </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                          Size *
                        </label>
                        <input
                          required
                          value={variantForm.size_label}
                          onChange={(event) =>
                            setVariantForm({
                              ...variantForm,
                              size_label: event.target.value,
                            })
                          }
                          placeholder="e.g. 42"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                          Size System *
                        </label>
                        <select
                          required
                          value={variantForm.size_system}
                          onChange={(event) =>
                            setVariantForm({
                              ...variantForm,
                              size_system: event.target.value,
                            })
                          }
                          className={inputClass}
                        >
                          <option value="EU">EU</option>
                          <option value="US">US</option>
                          <option value="UK">UK</option>
                          <option value="CM">CM</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                          Color *
                        </label>
                        <input
                          required
                          value={variantForm.color}
                          onChange={(event) =>
                            setVariantForm({ ...variantForm, color: event.target.value })
                          }
                          placeholder="e.g. Black / White"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                          Price (₱) *
                        </label>
                        <input
                          required
                          min="0"
                          step="0.01"
                          type="number"
                          value={variantForm.price}
                          onChange={(event) =>
                            setVariantForm({
                              ...variantForm,
                              price: Number(event.target.value),
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                          Compare-at Price (₱)
                        </label>
                        <input
                          min="0"
                          step="0.01"
                          type="number"
                          value={variantForm.compare_at_price ?? ''}
                          onChange={(event) =>
                            setVariantForm({
                              ...variantForm,
                              compare_at_price:
                                event.target.value === ''
                                  ? null
                                  : Number(event.target.value),
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      
<div>
  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
    {selectedVariant ? 'Stock Quantity *' : 'Initial Stock *'}
  </label>

  <input
    required
    min="0"
    step=""
    type="number"
    value={variantForm.stock_quantity}
    onChange={(event) =>
      setVariantForm({
        ...variantForm,
        stock_quantity: Math.max(0, Math.floor(Number(event.target.value))),
      })
    }
    className={inputClass}
  />

  <p className="mt-1 text-xs text-gray-400">
    {selectedVariant
      ? 'Update the available stock for this variant.'
      : 'Enter the starting stock for this new variant.'}
  </p>
</div>


                      <div className="flex items-center gap-2 self-center pt-5">
                        <input
                            id="variant-active"
                            type="checkbox"
                            checked={variantForm.is_active}
                            onChange={(event) =>
                            setVariantForm({
                                ...variantForm,
                                is_active: event.target.checked,
                            })
                            }
                            className="h-4 w-4 accent-[#123A8C]"
                        />

                        <label
                            htmlFor="variant-active"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Active variant
                        </label>
                        </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-[#123A8C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2d6d] disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving
                    ? 'Saving...'
                    : formMode === 'create'
                      ? 'Save Product'
                      : formMode === 'edit'
                        ? 'Update Product'
                        : selectedVariant
                          ? 'Update Variant'
                          : 'Add Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
