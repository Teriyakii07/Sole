import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Image as ImageIcon, ShoppingBag } from 'lucide-react';

import { getProductById } from '../../controllers/productControllers';
import { supabase } from '../../lib/supabaseClient';
import type { Product } from '../../models/Product';
import { handleImageError } from '../../lib/imageFallback';
import { useCart } from '../../context/Cartcontext';
import { useFavorites } from '../../context/Favoritescontext';

interface Variant {
  id: string;
  size_label: string;
  size_system: string;
  color: string;
  price: number;
  stock_quantity: number;
}

export default function ProductCatalog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setLoading(true);
      setError('');
      setSelectedVariantId(null);
      setSizeError(false);

      try {
        if (!id) {
          setProduct(null);
          return;
        }

        const [result, variantResult] = await Promise.all([
          getProductById(id),
          supabase
            .from('product_variants')
            .select('id, size_label, size_system, color, price, stock_quantity')
            .eq('product_id', id)
            .eq('is_active', true),
        ]);

        if (variantResult.error) {
          console.error('Unable to load sizes:', variantResult.error);
        }

        if (isMounted) {
          setProduct(result);
          setVariants(
            ((variantResult.data ?? []) as Variant[])
              .map((v) => ({ ...v, price: Number(v.price) }))
              .sort((a, b) =>
                a.size_label.localeCompare(b.size_label, undefined, { numeric: true })
              )
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load product.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? null,
    [variants, selectedVariantId]
  );

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-slate-500">Loading product details...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-700">
          {error ? 'Unable to Load Product' : 'Product Not Found'}
        </h2>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-lg bg-[#1E2E78] px-4 py-2 text-white"
        >
          Back to Home
        </button>
      </main>
    );
  }

  const favorited = isFavorite(product.id);

  const outOfStock =
    variants.length > 0
      ? variants.every((v) => v.stock_quantity === 0)
      : product.stockCount === 0;

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : variants.length > 0
      ? Math.min(...variants.map((v) => v.price))
      : product.price;

  async function handleAddToCart(): Promise<boolean> {
    if (!selectedVariant) {
      setSizeError(true);
      return false;
    }
    await addToCart(selectedVariant.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    return true;
  }

  async function handleBuyNow() {
    if (!selectedVariant) {
      setSizeError(true);
      return;
    }
    await addToCart(selectedVariant.id);
    navigate('/cart');
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 items-start gap-8 rounded-2xl bg-slate-100 p-6 md:grid-cols-2 md:p-10">

        {/* Left Column: Product Images */}
        <div className="grid grid-cols-2 gap-3">
          {product.galleryImages &&
          product.galleryImages.length > 0 ? (
            product.galleryImages.map(
              (img: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-center rounded-xl bg-white p-3 shadow-sm"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full max-w-md object-contain"
                      onError={handleImageError}
                    />
                  ) : (
                    <ImageIcon aria-hidden="true" className="text-gray-300" size={48} />
                  )}
                </div>
              )
            )
          ) : (
            <div className="col-span-2 flex items-center justify-center rounded-xl bg-white p-6 shadow-sm">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full max-w-md object-contain"
                  onError={handleImageError}
                />
              ) : (
                <ImageIcon aria-hidden="true" className="text-gray-300" size={48} />
              )}
            </div>
          )}
        </div>

        {/* Right Column: Product Information */}
        <div className="flex h-full flex-col justify-between space-y-6 pt-2">
          <div>
            <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#1E2E78] md:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 text-xs font-medium uppercase leading-relaxed text-slate-600 md:text-sm">
              {product.description}
            </p>

            <ul className="mt-6 space-y-1.5 text-xs font-semibold text-slate-800 md:text-sm">
              <li>
                • STYLE: {product.styleCode || 'Not specified'}
              </li>
              <li>
                • COLOUR: {selectedVariant?.color || product.color || 'Not specified'}
              </li>
              <li>
                • CATEGORY: {product.category || 'Not specified'}
              </li>
            </ul>

            {/* Size picker */}
            <div className="mt-6">
              <p className="mb-2 text-xs font-extrabold uppercase text-slate-900">
                Select size
              </p>

              {variants.length === 0 ? (
                <p className="text-xs font-semibold text-red-600">
                  No sizes available right now.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const soldOut = v.stock_quantity === 0;
                    const selected = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={soldOut}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setSizeError(false);
                        }}
                        className={`min-w-[56px] rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                          selected
                            ? 'border-[#1E2E78] bg-[#1E2E78] text-white'
                            : 'border-slate-300 bg-white text-slate-800 hover:border-[#1E2E78]'
                        } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:line-through`}
                      >
                        {v.size_system} {v.size_label}
                      </button>
                    );
                  })}
                </div>
              )}

              {sizeError && (
                <p className="mt-2 text-xs font-bold text-red-600">
                  Please select a size first.
                </p>
              )}
            </div>

            {selectedVariant &&
              selectedVariant.stock_quantity > 0 &&
              selectedVariant.stock_quantity <= 3 && (
                <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-blue-900">
                  ONLY {selectedVariant.stock_quantity} LEFT — MAKE IT YOURS!
                </p>
              )}

            {outOfStock && (
              <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-red-600">
                OUT OF STOCK
              </p>
            )}

            <div className="mt-6">
              <p className="text-sm font-extrabold uppercase text-slate-900">
                {selectedVariant?.color || product.color || product.name}
              </p>

              <p className="text-lg font-black text-slate-900">
                ₱{displayPrice.toLocaleString('en-PH')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              disabled={outOfStock}
              onClick={() => void handleBuyNow()}
              className="flex-1 rounded-xl bg-[#1E2E78] py-3.5 text-center text-sm font-extrabold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#16235e] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              BUY NOW
            </button>

            <button
              disabled={outOfStock}
              onClick={() => void handleAddToCart()}
              className="rounded-xl bg-[#1E2E78] p-3.5 text-white shadow-lg transition-all hover:bg-[#16235e] disabled:cursor-not-allowed disabled:bg-gray-400"
              title={added ? 'Added!' : 'Add to Cart'}
              aria-label="Add to cart"
            >
              <ShoppingBag size={20} />
            </button>

            <button
              onClick={() => void toggleFavorite(product)}
              aria-pressed={favorited}
              className="rounded-xl bg-[#1E2E78] p-3.5 text-white shadow-lg transition-all hover:bg-[#16235e]"
              title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
              aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={20} fill={favorited ? '#ffffff' : 'none'} />
            </button>
          </div>

          {added && (
            <p className="text-xs font-bold text-[#1E2E78]">Added to your cart.</p>
          )}
        </div>
      </div>
    </main>
  );
}