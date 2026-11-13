import { useEffect, useState } from 'react';
import Hero from '../components/Home/Hero';
import CategorySection from '../components/Home/CategorySection';
import NewArrivals from '../components/Home/NewArrivals';
import PromoBanner from '../components/Home/PromoBanner';
import {
  getHomepageCategories,
  getHomepageProducts,
} from '../../controllers/productControllers';
import type {
  Product,
  HomeCategory,
} from '../../models/Product';

export default function HomePage() {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadHomepage() {
      setLoading(true);
      setError('');

      try {
        const [categoryData, productData] = await Promise.all([
          getHomepageCategories(),
          getHomepageProducts(),
        ]);

        if (isMounted) {
          setCategories(categoryData);
          setProducts(productData);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load homepage data.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHomepage();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main>
      <Hero />

      {error && (
        <p className="px-5 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <CategorySection
        categories={categories}
        loading={loading}
      />

      <NewArrivals
        products={products}
        loading={loading}
      />

      <PromoBanner />
    </main>
  );
}
