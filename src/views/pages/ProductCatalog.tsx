
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';

import { useAuthPrompt } from '../../context/AuthPromptContext';
import { getProductById } from '../../controllers/productControllers';
import { useCartController } from '../../controllers/cartControllers';
import {
  isFavorite as checkFavorite,
  toggleFavorite,
  subscribeToFavorites,
} from '../../controllers/favoritesControllers';
import type { Product, ProductVariant } from '../../models/Product';

export default function ProductCatalog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartController();
  const { requireLogin } = useAuthPrompt();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | '';
  }>({
    message: '',
    type: '',
  });

  function showNotification(
    message: string,
    type: 'success' | 'error'
  ) {
    setNotification({ message, type });

    window.setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  }

  // LOAD PRODUCT
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setLoading(true);
      setError('');

      try {
        if (!id) {
          setProduct(null);
          return;
        }

        const result = await getProductById(id);

        if (isMounted) {
          setProduct(result);
          setSelectedVariant(null);
          setQuantity(1);
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
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // SYNC FAVORITES
  useEffect(() => {
    if (!product) return;

    const updateFavorite = () => {
      setIsFavorite(checkFavorite(product.id));
    };

    updateFavorite();

    return subscribeToFavorites(updateFavorite);
  }, [product]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading product details...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-bold text-slate-700">
          {error ? 'Unable to Load Product' : 'Product Not Found'}
        </h2>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-5 rounded-lg bg-[#123A8C] px-6 py-3 text-white hover:bg-[#D7192D]"
        >
          Back to Home
        </button>
      </main>
    );
  }

  const currentProduct = product;

  // Only active variants are available for selection.
  const variants = (currentProduct.variants ?? []).filter(
    (variant) => variant.isActive
  );

  const selectedStock = selectedVariant?.stockQuantity ?? 0;

  const maximumQuantity = selectedVariant
    ? Math.min(selectedStock, 99)
    : 1;

  const isOutOfStock =
    variants.length === 0 ||
    variants.every((variant) => variant.stockQuantity <= 0);

  function handleAddToBag(goToCheckout = false) {
    if (!requireLogin()) return;

    if (!selectedVariant) {
      showNotification('Please select a shoe size first.', 'error');
      return;
    }

    if (selectedVariant.stockQuantity <= 0) {
      showNotification('This shoe size is out of stock.', 'error');
      return;
    }

    if (quantity > selectedVariant.stockQuantity) {
      showNotification(
        `Only ${selectedVariant.stockQuantity} pair(s) available for this size.`,
        'error'
      );
      return;
    }

    addToCart(currentProduct, selectedVariant, quantity);

    if (goToCheckout) {
      navigate('/checkout');
    } else {
      showNotification(
        `${currentProduct.name} added to your bag!`,
        'success'
      );
    }
  }

  function handleToggleFavorite() {
    if (!requireLogin()) return;

    const added = toggleFavorite(currentProduct);
    setIsFavorite(added);

    showNotification(
      added
        ? `${currentProduct.name} added to your favorites!`
        : `${currentProduct.name} removed from your favorites.`,
      'success'
    );
  }

  return (
    <main className="relative min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">

      {/* NOTIFICATION */}
      {notification.message && (
        <div
          role="status"
          className={`fixed right-5 top-5 z-50 flex w-[calc(100%-40px)] max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${
            notification.type === 'success'
              ? 'border-green-200'
              : 'border-red-200'
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              notification.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {notification.type === 'success' ? (
              <Check size={21} />
            ) : (
              <AlertCircle size={21} />
            )}
          </div>

          <div className="flex-1 pt-1">
            <p className="text-sm font-bold text-gray-900">
              {notification.type === 'success' ? 'Success' : 'Notice'}
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-600">
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setNotification({ message: '', type: '' })
            }
            className="text-gray-400 transition hover:text-gray-700"
            aria-label="Close notification"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="mx-auto grid max-w-[1450px] grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">

        {/* PRODUCT IMAGE */}
        <section className="lg:col-span-7">
          <div className="flex min-h-[400px] items-center justify-center rounded-xl bg-white sm:min-h-[600px] lg:min-h-[680px]">
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              className="h-full max-h-[680px] w-full object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  '/images/product-placeholder.png';
              }}
            />
          </div>
        </section>

        {/* PRODUCT INFORMATION */}
        <section className="flex flex-col lg:col-span-5 lg:pt-2">

          {/* NAME AND PRICE */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold uppercase text-[#123A8C] underline underline-offset-4">
                {currentProduct.category || 'SOLE COLLECTION'}
              </p>

              <h1 className="mt-5 text-2xl font-semibold uppercase leading-tight text-gray-900 sm:text-3xl">
                {currentProduct.name}
              </h1>

              <p className="mt-3 text-xl font-bold text-gray-900">
                {(selectedVariant?.price ?? currentProduct.price).toLocaleString(
                  'en-PH',
                  {
                    style: 'currency',
                    currency: 'PHP',
                    maximumFractionDigits: 0,
                  }
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label="Toggle favorite"
              aria-pressed={isFavorite}
              className="p-2 text-[#123A8C] transition hover:scale-110"
            >
              <Heart
                size={27}
                fill={isFavorite ? '#123A8C' : 'none'}
              />
            </button>
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-b border-gray-200 pb-5 text-sm">
            <p>
              COLOR:{' '}
              <span className="font-semibold uppercase">
                {selectedVariant?.color ||
                  currentProduct.color ||
                  'Not specified'}
              </span>
            </p>

            <p>
              PRODUCT SKU:{' '}
              <span className="font-semibold">
                {selectedVariant?.sku ||
                  currentProduct.styleCode ||
                  'Not specified'}
              </span>
            </p>
          </div>

          {/* DESCRIPTION */}
          {currentProduct.description && (
            <p className="mt-5 text-sm leading-6 text-gray-600">
              {currentProduct.description}
            </p>
          )}

          {/* STOCK INFORMATION */}
          <p
            className={`mt-5 text-sm font-bold ${
              !selectedVariant
                ? isOutOfStock
                  ? 'text-red-600'
                  : 'text-gray-700'
                : selectedStock <= 0
                  ? 'text-red-600'
                  : 'text-gray-700'
            }`}
          >
            {!selectedVariant
              ? isOutOfStock
                ? 'OUT OF STOCK'
                : 'SELECT A SIZE TO CHECK STOCK'
              : selectedStock <= 0
                ? 'THIS SIZE IS OUT OF STOCK'
                : selectedStock <= 3
                  ? `ONLY ${selectedStock} LEFT — MAKE IT YOURS!`
                  : `${selectedStock} PAIRS AVAILABLE`}
          </p>

          {/* SIZE SELECTION */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm">
                SIZE:{' '}
                <span className="font-bold text-[#123A8C]">
                  {selectedVariant
                    ? `US ${selectedVariant.sizeLabel}`
                    : 'US'}
                </span>
              </p>

              <button
                type="button"
                onClick={() =>
                  showNotification('Size chart coming soon.', 'error')
                }
                className="text-sm font-bold text-[#123A8C] underline underline-offset-4"
              >
                SIZE CHART
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {variants.map((variant) => {
                const outOfStock = variant.stockQuantity <= 0;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }}
                    className={`flex min-h-[65px] flex-col items-center justify-center border transition ${
                      selectedVariant?.id === variant.id
                        ? 'border-[#123A8C] bg-[#123A8C] text-white'
                        : outOfStock
                          ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-[#123A8C]'
                    }`}
                  >
                    <span className="text-[10px]">US M</span>
                    <span className="text-lg font-semibold">
                      {variant.sizeLabel}
                    </span>
                    {outOfStock && (
                      <span className="text-[9px]">SOLD OUT</span>
                    )}
                  </button>
                );
              })}
            </div>

            {variants.length === 0 && (
              <p className="mt-3 text-sm text-red-600">
                No active shoe sizes are available for this product.
              </p>
            )}
          </div>

          {/* QUANTITY */}
          <div className="mt-8 flex items-center justify-between bg-gray-100 px-5 py-4">
            <span className="text-sm font-medium text-gray-700">
              Quantity
            </span>

            <div className="flex items-center gap-7">
              <button
                type="button"
                disabled={quantity <= 1 || !selectedVariant}
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
                className="text-gray-900 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>

              <span className="min-w-5 text-center font-bold">
                {quantity}
              </span>

              <button
                type="button"
                disabled={
                  !selectedVariant ||
                  quantity >= maximumQuantity
                }
                onClick={() =>
                  setQuantity((current) =>
                    Math.min(maximumQuantity, current + 1)
                  )
                }
                className="text-gray-900 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* ADD TO BAG */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => handleAddToBag()}
            className="mt-5 flex w-full items-center justify-center gap-3 bg-[#123A8C] py-5 text-base font-bold uppercase tracking-wide text-white transition hover:bg-[#D7192D] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <ShoppingBag size={20} />
            {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
          </button>

          {/* BUY NOW */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => handleAddToBag(true)}
            className="mt-3 w-full border border-[#123A8C] py-4 font-bold uppercase tracking-wide text-[#123A8C] transition hover:bg-[#123A8C] hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
          >
            BUY NOW
          </button>

          {/* AUTHENTICITY */}
          <div className="mt-8 flex items-center gap-4 text-sm text-gray-800">
            <Check size={22} strokeWidth={2.5} />

            <p>
              <span className="font-bold">
                Authenticity Guaranteed:
              </span>{' '}
              100% Genuine Products.
            </p>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Step Into Style with SOLE.
          </p>
        </section>
      </div>
    </main>
  );
}
