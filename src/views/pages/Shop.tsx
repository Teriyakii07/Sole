import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';

import {
  getHomepageProducts,
  getHomepageCategories,
} from '../../controllers/productControllers';

import type { Product, HomeCategory } from '../../models/Product';

const formatPrice = (price: number) =>
  price.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  });

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<HomeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FILTER STATES
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // LOAD PRODUCTS AND CATEGORIES
  useEffect(() => {
    async function loadShopData() {
      try {
        setLoading(true);
        setError('');

        const [productData, categoryData] = await Promise.all([
          getHomepageProducts(),
          getHomepageCategories(),
        ]);

        setProducts(productData);
        setCategoryList(categoryData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load shop data.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadShopData();
  }, []);

  // GET CATEGORY FROM URL
  useEffect(() => {
    const categorySlug = searchParams.get('category');

    if (!categorySlug) {
      setSelectedCategory('All');
      return;
    }

    const matchingCategory = categoryList.find(
      (category) =>
        category.slug?.toLowerCase() === categorySlug.toLowerCase()
    );

    setSelectedCategory(matchingCategory?.name ?? 'All');
  }, [searchParams, categoryList]);

  // GET UNIQUE BRANDS
  const brands = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((product) => product.brand?.trim())
            .filter((brand): brand is string => Boolean(brand))
        ),
      ].sort(),
    [products]
  );

  // FILTER AND SORT PRODUCTS
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // SEARCH
    if (search.trim()) {
      const searchValue = search.trim().toLowerCase();

      result = result.filter((product) => {
        const name = product.name?.toLowerCase() ?? '';
        const brand = product.brand?.toLowerCase() ?? '';
        const category = product.category?.toLowerCase() ?? '';

        return (
          name.includes(searchValue) ||
          brand.includes(searchValue) ||
          category.includes(searchValue)
        );
      });
    }

    // BRAND FILTER
    if (selectedBrand !== 'All') {
      result = result.filter(
        (product) =>
          product.brand?.trim().toLowerCase() ===
          selectedBrand.trim().toLowerCase()
      );
    }

    // CATEGORY FILTER
    if (selectedCategory !== 'All') {
      result = result.filter(
        (product) =>
          product.category?.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase()
      );
    }

    // MINIMUM PRICE
    if (minPrice !== '') {
      result = result.filter(
        (product) => product.price >= Number(minPrice)
      );
    }

    // MAXIMUM PRICE
    if (maxPrice !== '') {
      result = result.filter(
        (product) => product.price <= Number(maxPrice)
      );
    }

    // SORTING
    if (sortBy === 'low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-low') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
      );
    }

    return result;
  }, [
    products,
    search,
    selectedBrand,
    selectedCategory,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  // CHANGE CATEGORY
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);

    if (value === 'All') {
      setSearchParams({});
      return;
    }

    const matchingCategory = categoryList.find(
      (category) => category.name === value
    );

    if (matchingCategory) {
      setSearchParams({ category: matchingCategory.slug });
    }
  };

  // CLEAR FILTERS
  const clearFilters = () => {
    setSearch('');
    setSelectedBrand('All');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    search !== '' ||
    selectedBrand !== 'All' ||
    selectedCategory !== 'All' ||
    minPrice !== '' ||
    maxPrice !== '';

  return (
    <main className="h-[calc(100dvh-80px+180px)] overflow-hidden bg-white px-4 pb-16 pt-5 sm:px-6 sm:pt-6 lg:px-10">
      <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col">

        {/* PAGE HEADER */}
        <div className="mb-4 shrink-0">
          <p className="mb-2 text-sm font-bold tracking-[3px] text-[#D7192D]">
            STEP INTO STYLE
          </p>

          <h1 className="text-3xl font-black uppercase tracking-tight text-[#123A8C] sm:text-4xl">
            All Shoes
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Find the perfect pair for your everyday style.
          </p>
        </div>

        {/* SEARCH AND SORT */}
        <div className="mb-4 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search shoes, brands, or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-gray-300 py-3 pl-12 pr-4 text-sm outline-none focus:border-[#123A8C]"
            />
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="sort-products"
              className="whitespace-nowrap text-sm text-gray-600"
            >
              Sort by:
            </label>

            <select
              id="sort-products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#123A8C] sm:w-auto"
            >
              <option value="newest">Newest</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* SHOP CONTENT */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* FILTER SIDEBAR */}
          <aside className="hidden h-fit border border-gray-200 p-4 lg:block">

            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={19}
                  className="text-[#123A8C]"
                />

                <h2 className="font-bold uppercase text-[#123A8C]">
                  Filters
                </h2>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-[#D7192D] hover:underline"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            {/* BRAND FILTER */}
            <div className="border-t border-gray-200 py-3">
              <h3 className="mb-3 text-sm font-bold text-gray-900">
                Brand
              </h3>

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white p-3 text-sm outline-none focus:border-[#123A8C]"
              >
                <option value="All">All Brands</option>

                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY FILTER */}
            <div className="border-t border-gray-200 py-3">
              <h3 className="mb-3 text-sm font-bold text-gray-900">
                Category
              </h3>

              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white p-3 text-sm outline-none focus:border-[#123A8C]"
              >
                <option value="All">All Categories</option>

                {categoryList.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PRICE FILTER */}
            <div className="border-t border-gray-200 py-3">
              <h3 className="mb-3 text-sm font-bold text-gray-900">
                Price Range
              </h3>

              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="min-price"
                    className="mb-2 block text-xs text-gray-500"
                  >
                    Minimum (₱)
                  </label>

                  <input
                    id="min-price"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-sm outline-none focus:border-[#123A8C]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="max-price"
                    className="mb-2 block text-xs text-gray-500"
                  >
                    Maximum (₱)
                  </label>

                  <input
                    id="max-price"
                    type="number"
                    min="0"
                    placeholder="No limit"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-sm outline-none focus:border-[#123A8C]"
                  />
                </div>
              </div>

              {minPrice !== '' &&
                maxPrice !== '' &&
                Number(minPrice) > Number(maxPrice) && (
                  <p className="mt-2 text-xs text-red-600">
                    Minimum price cannot exceed maximum price.
                  </p>
                )}
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="w-full border border-[#123A8C] py-3 text-xs font-bold text-[#123A8C] transition hover:bg-[#123A8C] hover:text-white"
            >
              RESET FILTERS
            </button>
          </aside>

          {/* PRODUCT RESULTS */}
          <section className="flex min-h-0 flex-col pl-2">

            {/* PRODUCT COUNT */}
            <div className="mb-3 shrink-0">
              <p className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-bold text-gray-900">
                  {filteredProducts.length}
                </span>{' '}
                of{' '}
                <span className="font-bold text-gray-900">
                  {products.length}
                </span>{' '}
                products
              </p>
            </div>

            {/* ONLY THE SHOES SCROLL */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2">
              {loading ? (
                <div className="py-20 text-center">
                  <p className="text-gray-500">
                    Loading shoes...
                  </p>
                </div>
              ) : error ? (
                <div className="rounded border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-red-600">{error}</p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 font-bold text-[#123A8C] hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    No Shoes Found
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Try changing your search or filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 bg-[#123A8C] px-6 py-3 text-sm font-bold text-white hover:bg-[#D7192D]"
                  >
                    CLEAR FILTERS
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group min-w-0 no-underline"
                    >
                      {/* PRODUCT IMAGE */}
                      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded bg-[#F5F6FA]">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="pt-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#123A8C]">
                          {product.brand || product.category}
                        </p>

                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-[#123A8C]">
                          {product.name}
                        </h3>

                        <p className="mt-2 text-sm font-bold text-black">
                          {formatPrice(product.price)}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}