
import { useState } from 'react'
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [activeLink, setActiveLink] = useState('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="relative z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <a href="/" aria-label="SOLE home" className="shrink-0">
          <img
            src="/images/sole-logo.png"
            alt="SOLE"
            className="h-14 w-24 object-contain sm:w-28"
          />
        </a>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex lg:gap-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActiveLink(link.label)}
              className={`border-b-2 px-1 py-2 text-base transition ${
                activeLink === link.label
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-800 hover:border-gray-400'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Search products"
            className="transition hover:text-sole-blue"
            onClick={() => window.location.assign('/shop')}
          >
            <Search size={25} strokeWidth={2.4} />
          </button>

          <button
            type="button"
            aria-label="Favorites"
            className="transition hover:text-sole-blue"
            onClick={() => window.location.assign('/favorites')}
          >
            <Heart size={25} strokeWidth={2.4} />
          </button>

          <button
            type="button"
            aria-label="Shopping bag"
            className="transition hover:text-sole-blue"
            onClick={() => window.location.assign('/cart')}
          >
            <ShoppingBag size={25} strokeWidth={2.4} />
          </button>

          <button
            type="button"
            aria-label="User profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-300 bg-blue-600 font-bold text-white shadow-sm"
            onClick={() => window.location.assign('/profile')}
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
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                setActiveLink(link.label)
                setMobileMenuOpen(false)
              }}
              className="border-b border-gray-100 px-3 py-3 hover:bg-gray-50"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
