
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import {
  getFavorites,
  removeFavorite,
  subscribeToFavorites,
} from '../../controllers/favoritesControllers';
import type { FavoriteItem } from '../../controllers/favoritesControllers';

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // load and sync favorites
  useEffect(() => {
    const updateFavorites = () => {
      setFavorites(getFavorites());
    };

    updateFavorites();

    return subscribeToFavorites(updateFavorites);
  }, []);

  function handleRemove(id: string) {
    removeFavorite(id);
    setFavorites(getFavorites());
  }

  return (
    <main className="min-h-screen bg-white">

      {/* PAGE HEADER */}
      <section className="border-b border-gray-200 bg-[#F7F8FA] px-5 py-12 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D7192D]">
            YOUR PERSONAL COLLECTION
          </p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
                My Favorites<span className="text-[#D7192D]">.</span>
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-gray-500">
                Keep the sneakers you love close. Your favorite styles
                are saved here whenever you need them.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-5 py-3">
              <Heart size={19} className="text-[#123A8C]" />
              <span className="text-sm font-bold text-gray-800">
                {favorites.length} {favorites.length === 1 ? 'SAVED ITEM' : 'SAVED ITEMS'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAVORITES CONTENT */}
      <section className="px-5 py-10 sm:px-8 sm:py-14 lg:px-16">
        <div className="mx-auto max-w-7xl">

          {favorites.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-[#FAFAFA] px-6 py-12 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#EEF2FA]">
                <Heart
                  size={42}
                  strokeWidth={1.5}
                  className="text-[#123A8C]"
                />
              </div>

              <h2 className="mt-7 text-2xl font-extrabold text-[#111111]">
                Nothing saved yet.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                Looks like you haven't found your favorites yet.
                Explore our collection and save the sneakers you love.
              </p>

              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="mt-7 flex items-center gap-3 bg-[#123A8C] px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#D7192D]"
              >
                <ShoppingBag size={18} />
                Explore Collection
                <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <>
              {/* SECTION TITLE */}
              <div className="mb-7 flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold uppercase tracking-wide text-[#111111]">
                    Saved Sneakers
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Your handpicked styles.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#123A8C] transition hover:text-[#D7192D]"
                >
                  Continue Shopping
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* PRODUCT GRID */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {favorites.map((item) => (
                  <article
                    key={item.id}
                    className="group min-w-0"
                  >
                    {/* IMAGE */}
                    <div className="relative overflow-hidden rounded-xl bg-[#F5F6F8]">
                      <button
                        type="button"
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="flex h-[240px] w-full items-center justify-center p-7 sm:h-[270px]"
                        aria-label={`View ${item.name}`}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <ShoppingBag
                            size={55}
                            strokeWidth={1}
                            className="text-gray-300"
                          />
                        )}
                      </button>

                      {/* FAVORITE BADGE */}
                      <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                        <Heart
                          size={17}
                          fill="#D7192D"
                          className="text-[#D7192D]"
                        />
                      </div>

                      {/* REMOVE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        aria-label={`Remove ${item.name} from favorites`}
                        title="Remove from favorites"
                        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-[#D7192D] hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* VIEW PRODUCT OVERLAY */}
                      <button
                        type="button"
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="absolute bottom-0 left-0 right-0 flex translate-y-full items-center justify-center gap-2 bg-[#123A8C] py-4 text-xs font-bold uppercase tracking-wider text-white transition duration-300 group-hover:translate-y-0"
                      >
                        View Product
                        <ArrowRight size={15} />
                      </button>
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="pt-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="text-left"
                    >
                        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#111111] transition hover:text-[#123A8C]">
                        {item.name}
                        </h3>
                    </button>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                        {Number(item.price).toLocaleString('en-PH', {
                        style: 'currency',
                        currency: 'PHP',
                        maximumFractionDigits: 0,
                        })}
                    </p>
                    </div>
                  </article>
                ))}

              </div>
            </>
          )}
        </div>
      </section>

      {/* BOTTOM SHOPPING LINK */}
      {favorites.length > 0 && (
        <section className="border-t border-gray-200 bg-[#F7F8FA] px-5 py-8 sm:px-8 lg:px-16">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#111111]">
                Find your next favorite.
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Discover more styles from SOLE.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 text-sm font-bold uppercase text-[#123A8C] transition hover:text-[#D7192D]"
            >
              <ArrowLeft size={17} />
              Browse Sneakers
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
