
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

import type { Product } from '../../models/Product';

const shoeSizes = [
  '5', '5.5', '6', '6.5', '7',
  '7.5', '8', '8.5', '9', '9.5',
];

export default function ProductCatalog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addToCart } = useCartController();
  const { requireLogin } = useAuthPrompt();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // NOTIFICATION STATE
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | '';
  }>({
    message: '',
    type: '',
  });

  // SHOW NOTIFICATION
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
          setSelectedSize('');
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

  // CHECK AND SYNC FAVORITE STATUS
  useEffect(() => {
    if (!product) return;

    const updateFavorite = () => {
      setIsFavorite(checkFavorite(product.id));
    };

    updateFavorite();

    return subscribeToFavorites(updateFavorite);
  }, [product]);

  // LOADING
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading product details...
        </p>
      </main>
    );
  }

  // PRODUCT NOT FOUND
  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-bold text-slate-700">
          {error ? 'Unable to Load Product' : 'Product Not Found'}
        </h2>

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
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

  // PRODUCT IS GUARANTEED TO EXIST BELOW THIS POINT
  const currentProduct = product;

  const isOutOfStock = currentProduct.stockCount === 0;

  const maximumQuantity =
    typeof currentProduct.stockCount === 'number'
      ? Math.max(1, Math.min(currentProduct.stockCount, 99))
      : 99;

  // ADD TO CART OR BUY NOW
  function handleAddToBag(goToCheckout = false) {
    // Require login before adding anything to the cart.
    if (!requireLogin()) return;

    if (!selectedSize) {
      showNotification('Please select a shoe size first.', 'error');
      return;
    }

    if (isOutOfStock) {
      showNotification('Sorry, this product is out of stock.', 'error');
      return;
    }

    addToCart(currentProduct, selectedSize, quantity);

    if (goToCheckout) {
      navigate('/checkout');
    } else {
      showNotification(
        `${currentProduct.name} added to your bag!`,
        'success'
      );
    }
  }

  // ADD OR REMOVE FAVORITE
  function handleToggleFavorite() {
    // Require login before changing favorites.
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
              {notification.type === 'success'
                ? 'Success'
                : 'Notice'}
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

        {/* SINGLE PRODUCT IMAGE */}
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

          {/* PRODUCT NAME AND PRICE */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold uppercase text-[#123A8C] underline underline-offset-4">
                {currentProduct.category || 'SOLE COLLECTION'}
              </p>

              <h1 className="mt-5 text-2xl font-semibold uppercase leading-tight text-gray-900 sm:text-3xl">
                {currentProduct.name}
              </h1>

              <p className="mt-3 text-xl font-bold text-gray-900">
                {currentProduct.price.toLocaleString('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>

            {/* FAVORITE BUTTON */}
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
                {currentProduct.color || 'Not specified'}
              </span>
            </p>

            <p>
              PRODUCT SKU:{' '}
              <span className="font-semibold">
                {currentProduct.styleCode || 'Not specified'}
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
          {typeof currentProduct.stockCount === 'number' && (
            <p
              className={`mt-5 text-sm font-bold ${
                isOutOfStock
                  ? 'text-red-600'
                  : 'text-gray-700'
              }`}
            >
              {isOutOfStock
                ? 'OUT OF STOCK'
                : currentProduct.stockCount <= 3
                  ? `ONLY ${currentProduct.stockCount} LEFT — MAKE IT YOURS!`
                  : 'IN STOCK'}
            </p>
          )}

          {/* SIZE SELECTION */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm">
                SIZE:{' '}
                <span className="font-bold text-[#123A8C]">
                  {selectedSize ? `US ${selectedSize}` : 'US'}
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
              {shoeSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`flex min-h-[65px] flex-col items-center justify-center border transition ${
                    selectedSize === size
                      ? 'border-[#123A8C] bg-[#123A8C] text-white'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-[#123A8C]'
                  }`}
                >
                  <span className="text-[10px]">US M</span>
                  <span className="text-lg font-semibold">
                    {size}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY */}
          <div className="mt-8 flex items-center justify-between bg-gray-100 px-5 py-4">
            <span className="text-sm font-medium text-gray-700">
              Quantity
            </span>

            <div className="flex items-center gap-7">
              <button
                type="button"
                disabled={quantity <= 1}
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
                  quantity >= maximumQuantity || isOutOfStock
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
