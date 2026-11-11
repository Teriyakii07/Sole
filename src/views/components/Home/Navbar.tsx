import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react'

import { useCart } from '../../../context/Cartcontext'
import { useFavorites } from '../../../context/Favoritescontext'
import soleLogo from '../../../assets/images/solelogo.png'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

function Badge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D7192D] px-1 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const { favorites } = useFavorites()
  const [activeLink, setActiveLink] = useState('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="relative z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" aria-label="SOLE home" className="shrink-0">
          <img
            src={soleLogo}
            alt="SOLE"
            className="h-14 w-24 object-contain sm:w-28"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex lg:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setActiveLink(link.label)}
              className={`border-b-2 px-1 py-2 text-base transition ${
                activeLink === link.label
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-800 hover:border-gray-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Search products"
            className="transition hover:text-sole-blue"
            onClick={() => navigate('/search')}
          >
            <Search size={25} strokeWidth={2.4} />
          </button>

          <button
            type="button"
            aria-label="Favorites"
            className="relative transition hover:text-sole-blue"
            onClick={() => navigate('/favorites')}
          >
            <Heart size={25} strokeWidth={2.4} />
            <Badge count={favorites.length} />
          </button>

          <button
            type="button"
            aria-label="Shopping bag"
            className="relative transition hover:text-sole-blue"
            onClick={() => navigate('/cart')}
          >
            <ShoppingBag size={25} strokeWidth={2.4} />
            <Badge count={totalItems} />
          </button>

          <button
            type="button"
            aria-label="User profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-300 bg-blue-600 font-bold text-white shadow-sm"
            onClick={() => navigate('/profile')}
          >
            J
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <nav className="absolute left-0 top-full flex w-full flex-col border-t bg-white p-4 shadow-lg md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => {
                setActiveLink(link.label)
                setMobileMenuOpen(false)
              }}
              className="border-b border-gray-100 px-3 py-3 hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}