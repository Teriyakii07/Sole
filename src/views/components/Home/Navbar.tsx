
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, NavLink, Link } from 'react-router-dom';

import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react';

import { supabase } from '../../../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

function Badge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D7192D] px-1 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // GET LOGGED-IN USER AND LISTEN FOR AUTH CHANGES
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

  // CLOSE MOBILE MENU WHEN PAGE CHANGES
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // GET FIRST LETTER OF USER NAME
  const userInitial = (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    '?'
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  // NAVIGATION LINK STYLE
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

  // CHECK IF SHOP SHOULD BE ACTIVE
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
            aria-label="Favorites"
            className="transition hover:text-[#123A8C]"
            onClick={() => navigate('/favorites')}
          >
            <Heart size={27} strokeWidth={2.4} />
          </button>

          {/* SHOPPING BAG */}
          <button
            type="button"
            aria-label="Shopping bag"
            className="transition hover:text-[#123A8C]"
            onClick={() => navigate('/cart')}
          >
            <ShoppingBag size={27} strokeWidth={2.4} />
          </button>

          {/* USER PROFILE */}
          <button
            type="button"
            aria-label="User profile"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-blue-300 bg-blue-600 text-base font-bold text-white shadow-sm transition hover:bg-[#123A8C]"
            onClick={() => navigate('/profile')}
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
