
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, NavLink, Link } from 'react-router-dom';
import { useAuthPrompt } from '../../../context/AuthPromptContext';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react';
import {
  getFavorites,
  subscribeToFavorites,
} from '../../../controllers/favoritesControllers';
import { useCartController } from '../../../controllers/cartControllers';
import { supabase } from '../../../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requireLogin } = useAuthPrompt();
  const [favoriteCount, setFavoriteCount] = useState(0);
  const { totalItems } = useCartController();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // user ang authentication
  useEffect(() => {
    async function getLoggedInUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    getLoggedInUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // get and sync favorites
  useEffect(() => {
    const updateFavorites = () => {
      setFavoriteCount(getFavorites().length);
    };

    updateFavorites();

    return subscribeToFavorites(updateFavorites);
  }, []);

  // close mobile menu
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const userInitial = (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    '?'
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  const getNavLinkClass = (isActive: boolean) =>
    `relative py-2 text-base font-semibold transition-colors duration-300
    after:absolute after:bottom-0 after:left-0 after:h-[2px]
    after:w-full after:bg-[#123A8C]
    after:transition-opacity after:duration-300
    ${
      isActive
        ? 'text-[#123A8C] after:opacity-100'
        : 'text-gray-700 after:opacity-0 hover:text-[#123A8C] hover:after:opacity-100'
    }`;

  const isShopActive =
    location.pathname === '/shop' ||
    location.pathname.startsWith('/product/');

  return (
    <header className="relative z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-[80px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* TEXT LOGO */}
        <Link
          to="/"
          aria-label="SOLE home"
          className="shrink-0 no-underline"
        >
          <span className="text-[34px] font-black tracking-tight text-[#123A8C] sm:text-[38px]">
            SOLE.
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-10 md:flex">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              getNavLinkClass(isActive)
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/shop"
            className={() =>
              getNavLinkClass(isShopActive)
            }
          >
            Shop
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              getNavLinkClass(isActive)
            }
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              getNavLinkClass(isActive)
            }
          >
            Contact
          </NavLink>

        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-5">

          {/* SEARCH */}
          <button
            type="button"
            aria-label="Search products"
            className="transition hover:text-[#123A8C]"
            onClick={() => navigate('/shop')}
          >
            <Search size={27} strokeWidth={2.4} />
          </button>

          {/* FAVORITES */}
          <button
            type="button"
            aria-label={`Favorites, ${favoriteCount} saved items`}
            className="relative transition hover:text-[#123A8C]"
            onClick={() => {
              if (requireLogin()) {
                navigate('/favorites');
              }
            }}
          >
            <Heart size={27} strokeWidth={2.4} />

            {favoriteCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D7192D] px-1 text-[10px] font-bold text-white">
                {favoriteCount > 99 ? '99+' : favoriteCount}
              </span>
            )}
          </button>

          {/* SHOPPING BAG */}
          <button
            type="button"
            aria-label={`Shopping bag, ${totalItems} items`}
            className="relative transition hover:text-[#123A8C]"
            onClick={() => {
              if (requireLogin()) {
                navigate('/cart');
              }
            }}
          >
            <ShoppingBag size={27} strokeWidth={2.4} />

            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D7192D] px-1 text-[10px] font-bold text-white">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* USER PROFILE */}
          <button
            type="button"
            aria-label="User profile"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-blue-300 bg-blue-600 text-base font-bold text-white shadow-sm transition hover:bg-[#123A8C]"
            onClick={() => {
              if (requireLogin()) {
                navigate('/profile');
              }
            }}
          >
            {userInitial}
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={27} /> : <Menu size={27} />}
          </button>

        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      {mobileMenuOpen && (
        <nav className="absolute left-0 top-full flex w-full flex-col border-t border-gray-200 bg-white p-4 shadow-lg md:hidden">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `border-b border-gray-100 px-3 py-4 text-base font-semibold ${
                isActive
                  ? 'border-l-4 border-l-[#123A8C] bg-blue-50 text-[#123A8C]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/shop"
            className={() =>
              `border-b border-gray-100 px-3 py-4 text-base font-semibold ${
                isShopActive
                  ? 'border-l-4 border-l-[#123A8C] bg-blue-50 text-[#123A8C]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Shop
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `border-b border-gray-100 px-3 py-4 text-base font-semibold ${
                isActive
                  ? 'border-l-4 border-l-[#123A8C] bg-blue-50 text-[#123A8C]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `border-b border-gray-100 px-3 py-4 text-base font-semibold ${
                isActive
                  ? 'border-l-4 border-l-[#123A8C] bg-blue-50 text-[#123A8C]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Contact
          </NavLink>

        </nav>
      )}
    </header>
  );
}
