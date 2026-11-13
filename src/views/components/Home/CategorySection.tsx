import { ArrowRight } from 'lucide-react';
import type { HomeCategory } from '../../../models/Product';
import { useNavigate } from 'react-router-dom';

interface CategorySectionProps {
  categories: HomeCategory[];
  loading: boolean;
}

const primaryStroke = {
  stroke: '#123A8C',
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const detailStroke = {
  stroke: '#123A8C',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function ShoeIcon({ type }: { type: string }) {
  const name = type.toLowerCase();

  // LIFESTYLE
  if (name.includes('lifestyle')) {
    return (
      <svg viewBox="0 0 150 85" className="h-16 w-32" fill="none" aria-hidden="true">
        <path
          d="M13 55 C13 48 25 45 38 43 L63 23 C66 20 71 21 73 25 C84 38 108 38 123 26 L132 23 C136 34 138 48 138 62 L138 68 C138 70 135 71 130 71 L20 71 C14 71 11 68 11 63 C11 59 12 57 13 55 Z"
          {...primaryStroke}
        />
        <path d="M11 63 L138 63" {...detailStroke} />
        <path d="M24 63 L24 71" {...detailStroke} />
        <path d="M13 55 C24 55 33 52 39 44" {...detailStroke} />
        <path d="M74 28 C85 42 109 42 125 28" {...detailStroke} />
        <path d="M54 62 L66 41 M63 62 L75 41 M72 62 L84 41" {...detailStroke} />
        <path d="M44 40 L51 44 M51 34 L58 38 M58 28 L65 32" {...detailStroke} />
      </svg>
    );
  }

  // RUNNING
  if (name.includes('running')) {
    return (
      <svg viewBox="0 0 150 85" className="h-16 w-32" fill="none" aria-hidden="true">
        <path
          d="M9 50 C22 45 38 41 50 32 L65 17 C68 14 73 16 75 20 C87 33 108 32 125 20 L134 16 C133 27 135 39 141 49 L145 58 C145 62 140 65 131 65 C98 65 62 71 29 68 C16 66 9 59 9 50 Z"
          {...primaryStroke}
        />
        <path d="M10 53 C34 61 68 61 102 55 C120 52 134 53 143 56" {...detailStroke} />
        <path d="M42 63 C74 63 106 58 136 59" {...detailStroke} />
        <path d="M36 50 C64 49 94 41 128 29" {...detailStroke} />
        <path d="M54 52 C80 49 106 42 131 33" {...detailStroke} />
        <path d="M23 47 L32 45 M29 42 L38 40" {...detailStroke} />
        <path d="M49 34 L56 38 M56 27 L63 31" {...detailStroke} />
      </svg>
    );
  }

  // STREETWEAR
  if (name.includes('streetwear')) {
    return (
      <svg viewBox="0 0 150 85" className="h-16 w-32" fill="none" aria-hidden="true">
        <path
          d="M11 54 C11 46 22 43 38 42 L59 14 C62 10 69 10 72 15 L84 19 L124 14 C129 27 132 43 135 59 L137 68 L128 68 L125 72 L114 72 L111 68 L98 68 L95 72 L84 72 L81 68 L68 68 L65 72 L54 72 L51 68 L38 68 L35 72 L24 72 L21 68 L12 68 C10 64 10 59 11 54 Z"
          {...primaryStroke}
        />
        <path d="M11 60 L135 60" {...detailStroke} />
        <path d="M83 22 L126 19 M85 28 L128 25" {...detailStroke} />
        <path d="M11 52 L33 52 L43 41" {...detailStroke} />
        <path d="M44 60 L54 43 L82 43 L92 60" {...detailStroke} />
        <path d="M42 39 L50 42 M47 32 L55 35 M52 25 L60 28 M57 18 L65 21" {...detailStroke} />
      </svg>
    );
  }

  // TENNIS
  if (name.includes('tennis')) {
    return (
      <svg viewBox="0 0 150 85" className="h-16 w-32" fill="none" aria-hidden="true">
        <path
          d="M11 55 C12 47 24 44 39 43 L64 23 C67 20 72 20 75 24 C86 38 109 38 124 24 L133 22 C136 33 138 47 139 61 L141 68 C141 70 137 71 131 71 L19 71 C13 71 10 68 10 63 C10 59 10 57 11 55 Z"
          {...primaryStroke}
        />
        <path d="M10 63 L140 63" {...detailStroke} />
        <path d="M11 56 C18 50 28 50 35 55 L38 63" {...detailStroke} />
        <path d="M51 45 L88 45" {...detailStroke} />
        <path d="M53 63 L58 45 M66 63 L70 45 M79 63 L82 45" {...detailStroke} />
        <path d="M76 27 C87 41 109 41 125 27" {...detailStroke} />
        <path d="M45 40 L52 44 M52 33 L59 37 M59 26 L66 30" {...detailStroke} />
      </svg>
    );
  }

  // DEFAULT
  return (
    <svg viewBox="0 0 150 85" className="h-16 w-32" fill="none" aria-hidden="true">
      <path
        d="M12 55 C14 47 27 43 41 41 L64 21 C68 18 73 20 76 25 C88 38 109 37 124 25 L133 21 C136 33 138 47 140 60 C141 66 135 70 124 70 L24 70 C14 70 10 64 12 55 Z"
        {...primaryStroke}
      />
      <path d="M11 61 C45 64 95 63 140 59" {...detailStroke} />
      <path d="M44 53 C68 51 94 45 127 33" {...detailStroke} />
      <path d="M47 38 L54 42 M54 31 L61 35 M61 24 L68 28" {...detailStroke} />
    </svg>
  );
}

export default function CategorySection({
  categories,
  loading,
}: CategorySectionProps) {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/shop?category=${encodeURIComponent(slug)}`);
  };

  return (
    <section className="px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-extrabold uppercase text-sole-blue sm:text-lg">
            Shop by Category
          </h2>

          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="flex items-center gap-1 text-xs text-sole-blue sm:text-sm"
          >
            VIEW ALL
            <ArrowRight size={19} />
          </button>
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
          <div className="grid grid-cols-2 divide-x divide-gray-200 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.slug)}
                className="group flex min-h-[130px] flex-col items-center justify-center gap-2 px-3 py-4"
              >
                <div className="transition-transform duration-200 group-hover:-translate-y-1">
                  <ShoeIcon type={category.name} />
                </div>

                <span className="text-center text-xs font-extrabold uppercase tracking-wide text-sole-blue sm:text-sm">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}