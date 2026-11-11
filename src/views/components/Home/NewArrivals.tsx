import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { Product } from '../../../models/Product';
import ProductCard from './ProductCard';
import { useFavorites } from '../../../context/Favoritescontext';

interface NewArrivalsProps {
  products: Product[];
  loading: boolean;
}

export default function NewArrivals({
  products,
  loading,
}: NewArrivalsProps) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <section className="px-5 pb-8 pt-2 sm:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-extrabold uppercase text-sole-blue sm:text-lg">
          New Arrivals
        </h2>

        <a
          href="/shop"
          className="flex items-center gap-1 text-xs text-sole-blue sm:text-sm"
        >
          VIEW ALL <ArrowRight size={19} />
        </a>
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
        <div className="mx-auto grid max-w-[1050px] grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={isFavorite(product.id)}
              onToggleFavorite={() => void toggleFavorite(product)}
              onAddToCart={(p) => navigate(`/product/${p.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}