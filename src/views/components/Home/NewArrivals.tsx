
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Product } from '../../../models/Product';
import ProductCard from './ProductCard';
import { useCartController } from '../../../controllers/cartControllers';
import { useAuthPrompt } from '../../../context/AuthPromptContext';

interface NewArrivalsProps {
  products: Product[];
  loading: boolean;
}

export default function NewArrivals({
  products,
  loading,
}: NewArrivalsProps) {
  const [favorites, setFavorites] = useState<(string | number)[]>([]);
  const { addToCart, totalItems } = useCartController();
  const { requireLogin } = useAuthPrompt();

  function toggleFavorite(id: string | number) {
    if (!requireLogin()) return;

    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function handleAddToCart(product: Product) {
    if (!requireLogin()) return;

    addToCart(product, "1");
  }

  return (
    <section className="px-5 pb-8 pt-2 sm:px-8">
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
        <div className="mx-auto grid max-w-[750px] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.includes(product.id)}
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
    </section>
  );
}
