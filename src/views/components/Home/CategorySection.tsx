
import { ArrowRight } from 'lucide-react';
import type { HomeCategory } from '../../../models/Product';

interface CategorySectionProps {
  categories: HomeCategory[];
  loading: boolean;
}

export default function CategorySection({
  categories,
  loading,
}: CategorySectionProps) {
  return (
    <section className="px-5 py-5 sm:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-extrabold uppercase text-sole-blue sm:text-lg">
          Shop by Category
        </h2>

        <a
          href="/shop"
          className="flex items-center gap-1 text-xs text-sole-blue sm:text-sm"
        >
          VIEW ALL <ArrowRight size={19} />
        </a>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-gray-400">
          Loading categories...
        </p>
      ) : categories.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No categories available.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-7 lg:gap-5">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.slug)}`}
              className="group flex min-w-0 flex-col items-center"
            >
              <div className="flex h-20 w-full items-center justify-center sm:h-24">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <span className="mt-2 text-center text-[11px] sm:text-xs">
                {category.name}
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
