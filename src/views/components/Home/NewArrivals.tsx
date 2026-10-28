
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Product } from '../../../models/Product.ts'
import { getNewArrivals } from '../../../controllers/productControllers.ts';
import ProductCard from './ProductCard.tsx'

export default function NewArrivals() {
  const products = getNewArrivals()

  const [favorites, setFavorites] = useState<number[]>([])
  const [cart, setCart] = useState<Product[]>([])

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function addToCart(product: Product) {
    setCart((current) => [...current, product])
    window.alert(`${product.name} added to cart!`)
  }

  return (
    <section className="px-5 pb-8 pt-2 sm:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-extrabold uppercase text-sole-blue sm:text-lg">
          New Arrivals
        </h2>

        <a
          href="/shop"
          className="flex items-center gap-1 text-xs text-sole-blue sm:text-sm"
        >
          VIEW ALL <ArrowRight size={19} />
        </a>
      </div>

      <div className="mx-auto grid max-w-[750px] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={toggleFavorite}
            onAddToCart={addToCart}
          />
        ))}
      </div>

      {/* Temporary feedback while developing */}
      {cart.length > 0 && (
        <p className="mt-3 text-right text-xs text-gray-500">
          Items added this session: {cart.length}
        </p>
      )}
    </section>
  )
}
