import { useNavigate } from 'react-router-dom'
import { Heart, Image as ImageIcon } from 'lucide-react'
import type { Product } from '../../../models/Product'
import { handleImageError } from '../../../lib/imageFallback'

interface ProductCardProps {
  product: Product
  isFavorite: boolean
  onToggleFavorite: (id: string | number) => void
  onAddToCart: (product: Product) => void
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: ProductCardProps) {
  const navigate = useNavigate()

  // Jett: Navigate to product datasheet/catalog page
  const handleCardClick = () => {
    navigate(`/product/${product.id}`)
  }

  return (
    <article 
      onClick={handleCardClick}
      className="cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-md"
    >
      <div className="relative flex h-[140px] items-center justify-center bg-[#f4f4f4] sm:h-[170px]">

        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-3 sm:p-4"
            loading="lazy"
            onError={handleImageError}
          />
        )}
        {!product.image && (
          <ImageIcon aria-hidden="true" className="text-gray-300" size={32} />
        )}


        {/* Jett: Favorite Button: e.stopPropagation() prevents triggering handleCardClick */}
        <button
          type="button"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(product.id)
          }}
          className="absolute right-2 top-2 text-sole-blue transition hover:scale-110"
        >
          <Heart
            size={18}
            fill={isFavorite ? '#103b91' : 'none'}
            strokeWidth={1.8}
          />
        </button>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[32px] text-xs leading-tight font-bold sm:text-sm">
          {product.name}
        </h3>

        <p className="text-xs font-bold text-sole-blue sm:text-sm">
          {product.price.toLocaleString('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0,
          })}
        </p>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            className="rounded-sm bg-sole-blue px-3 py-2 text-[10px] text-white transition hover:bg-blue-800 sm:px-4 sm:text-xs"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </article>
  )
}