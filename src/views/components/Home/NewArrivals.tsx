
import { useEffect, useState } from 'react';
import { ArrowRight, Check, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../../models/Product';
import ProductCard from './ProductCard';
import { useCartController } from '../../../controllers/cartControllers';
import { useAuthPrompt } from '../../../context/AuthPromptContext';
import {
  getFavorites,
  toggleFavorite as toggleSavedFavorite,
  subscribeToFavorites,
} from '../../../controllers/favoritesControllers';

interface NewArrivalsProps {
  products: Product[];
  loading: boolean;
}

export default function NewArrivals({
  products,
  loading,
}: NewArrivalsProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | '';
  }>({
    message: '',
    type: '',
  });

  const { addToCart, totalItems } = useCartController();
  const { requireLogin } = useAuthPrompt();

  // load and sync favorites
  useEffect(() => {
    const updateFavorites = () => {
      setFavorites(getFavorites().map((item) => String(item.id)));
    };

    updateFavorites();

    const unsubscribe = subscribeToFavorites(updateFavorites);

    return unsubscribe;
  }, []);

  function showNotification(
    message: string,
    type: 'success' | 'error'
  ) {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  }

  function toggleFavorite(product: Product) {
    if (!requireLogin()) return;

    const alreadyFavorite = favorites.includes(String(product.id));

    toggleSavedFavorite(product);

    if (alreadyFavorite) {
      showNotification(
        `${product.name} removed from your favorites.`,
        'error'
      );
    } else {
      showNotification(
        `${product.name} added to your favorites!`,
        'success'
      );
    }
  }

  function handleAddToCart(product: Product) {
    if (!requireLogin()) return;

    addToCart(product, '1');

    showNotification(
      `${product.name} added to your bag!`,
      'success'
    );
  }

  return (
    <>
      {/* Notification Banner */}
      {notification.message && (
        <div
          className={`fixed right-5 top-5 z-50 flex w-[calc(100%-40px)] max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${
            notification.type === 'success'
              ? 'border-green-200'
              : 'border-red-200'
          }`}
        >
          <div
            className={`mt-0.5 ${
              notification.type === 'success'
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {notification.type === 'success' ? (
              <Check size={22} />
            ) : (
              <AlertCircle size={22} />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900">
              {notification.type === 'success' ? 'Success' : 'Notice'}
            </h3>

            <p className="mt-1 text-sm text-gray-600">
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

      <section className="px-5 pb-8 pt-2 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold uppercase text-sole-blue sm:text-lg">
              New Arrivals
            </h2>

            <Link
              to="/shop"
              className="flex items-center gap-1 text-xs text-sole-blue sm:text-sm"
            >
              VIEW ALL <ArrowRight size={19} />
            </Link>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-gray-400">
              Loading new arrivals...
            </p>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No new arrivals available right now.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(String(product.id))}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {totalItems > 0 && (
            <p className="mt-3 text-right text-xs text-gray-500">
              Items in your cart: {totalItems}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
