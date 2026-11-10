
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';

import { getProductById } from '../../controllers/productControllers';
import type { Product } from '../../models/Product';

export default function ProductCatalog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                 
<img
  src={product.image}
  alt={product.name}
  className="w-full max-w-md object-contain"
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/images/product-placeholder.png';
  }}
/>

                </div>
              )
            )
          ) : (
            <div className="col-span-2 flex items-center justify-center rounded-xl bg-white p-6 shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-md object-contain"
              />
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
                • COLOUR: {product.color || 'Not specified'}
              </li>
              <li>
                • CATEGORY: {product.category || 'Not specified'}
              </li>
            </ul>

            {typeof product.stockCount === 'number' &&
              product.stockCount > 0 &&
              product.stockCount <= 3 && (
                <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-blue-900">
                  ONLY {product.stockCount} LEFT — MAKE IT YOURS!
                </p>
              )}

            {product.stockCount === 0 && (
              <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-red-600">
                OUT OF STOCK
              </p>
            )}

            <div className="mt-6">
              <p className="text-sm font-extrabold uppercase text-slate-900">
                {product.color || product.name}
              </p>

              <p className="text-lg font-black text-slate-900">
                ₱{product.price.toLocaleString('en-PH')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              disabled={product.stockCount === 0}
              onClick={() => alert(`Buying ${product.name} now!`)}
              className="flex-1 rounded-xl bg-[#1E2E78] py-3.5 text-center text-sm font-extrabold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#16235e] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              BUY NOW
            </button>

            <button
              disabled={product.stockCount === 0}
              onClick={() => alert(`${product.name} added to cart!`)}
              className="rounded-xl bg-[#1E2E78] p-3.5 text-white shadow-lg transition-all hover:bg-[#16235e] disabled:cursor-not-allowed disabled:bg-gray-400"
              title="Add to Cart"
            >
              <ShoppingBag size={20} />
            </button>

            <button
              onClick={() =>
                alert(`${product.name} added to favorites!`)
              }
              className="rounded-xl bg-[#1E2E78] p-3.5 text-white shadow-lg transition-all hover:bg-[#16235e]"
              title="Add to Favorites"
            >
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
