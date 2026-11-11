import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Product } from '../../../models/Product'

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
      <div className="relative flex h-[100px] items-center justify-center bg-[#f4f4f4] sm:h-[115px]">

        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-2"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/product-placeholder.png';
          }}
        />


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

      <div className="p-2">
        <h3 className="line-clamp-2 min-h-[25px] text-[9px] leading-tight font-bold sm:text-[10px]">
          {product.name}
        </h3>

        <p className="text-[10px] font-bold text-sole-blue">
          {product.price.toLocaleString('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0,
          })}
        </p>

        <div className="mt-2 flex justify-end">
          {/* Jett: Add to Cart Button: e.stopPropagation() prevents triggering handleCardClick */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            className="rounded-sm bg-sole-blue px-3 py-1.5 text-[8px] text-white transition hover:bg-blue-800 sm:text-[9px]"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </article>
  )
}