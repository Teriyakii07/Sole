import { Link, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ProductCard from '../components/Home/ProductCard'
import { useFavorites } from '../../context/Favoritescontext'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites, loading, toggleFavorite } = useFavorites()

  return (
    <main className="min-h-screen bg-white px-[2.8%] pt-6 pb-16 font-sans">
      <div>
        <p className="mb-1 text-[18px] font-bold text-[#D7192D]">Your Wishlist</p>
        <h1 className="font-montserrat text-[40px] font-black tracking-tight text-black max-[600px]:text-[30px]">
          Favorites
        </h1>
        <p className="mt-1 text-[15px] text-gray-500">
          {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      <hr className="mt-6 border-0 border-t border-gray-200" />

      {loading ? (
        <p className="pt-16 text-center text-gray-500">Loading favorites...</p>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center pt-[155px] text-center max-[600px]:pt-[110px]">
          <Heart size={54} strokeWidth={1.3} color="#999999" aria-hidden="true" />
          <h2 className="mt-6 font-montserrat text-[24px] font-bold text-black">
            No favorites yet
          </h2>
          <p className="mt-2 text-[18px] text-gray-500">
            Tap the heart on any sneaker to save it here.
          </p>
          <Link
            to="/shop"
            className="mt-7 inline-flex h-[57px] items-center justify-center rounded-[3px] bg-[#173B8C] px-[29px] text-[16px] font-bold text-white no-underline transition-colors hover:bg-[#0B2B6D]"
          >
            START SHOPPING
          </Link>
        </div>
      ) : (
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {favorites.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite
              onToggleFavorite={() => void toggleFavorite(product)}
              onAddToCart={(p) => navigate(`/product/${p.id}`)}
            />
          ))}
        </section>
      )}
    </main>
  )
}