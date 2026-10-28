
import type { Product } from '../models/Product'

const products: Product[] = [
  {
    id: 1,
    name: 'PUMA White-Dark Crimson-Gum',
    price: 5795,
    image: '/images/products/puma-crimson-gum.png',
    category: 'Sneakers',
    isNew: true,
  },
  {
    id: 2,
    name: 'PUMA White-Dark Crimson-Gum',
    price: 5795,
    image: '/images/products/puma-crimson-gum.png',
    category: 'Sneakers',
    isNew: true,
  },
  {
    id: 3,
    name: 'PUMA White-Dark Crimson-Gum',
    price: 5795,
    image: '/images/products/puma-crimson-gum.png',
    category: 'Sneakers',
    isNew: true,
  },
  {
    id: 4,
    name: 'PUMA White-Dark Crimson-Gum',
    price: 5795,
    image: '/images/products/puma-crimson-gum.png',
    category: 'Sneakers',
    isNew: true,
  },
  {
    id: 5,
    name: 'PUMA White-Dark Crimson-Gum',
    price: 5795,
    image: '/images/products/puma-crimson-gum.png',
    category: 'Sneakers',
    isNew: true,
  },
  {
    id: 6,
    name: 'PUMA White-Dark Crimson-Gum',
    price: 5795,
    image: '/images/products/puma-crimson-gum.png',
    category: 'Sneakers',
    isNew: true,
  },
  {
    id: 7,
    name: 'PUMA White-Dark Crimson-Gum',
    price: 5795,
    image: '/images/products/puma-crimson-gum.png',
    category: 'Sneakers',
    isNew: true,
  },
  {
    id: 8,
    name: 'PUMA White-Dark Crimson-Gum',
    price: 5795,
    image: '/images/products/puma-crimson-gum.png',
    category: 'Sneakers',
    isNew: true,
  },
]

export function getNewArrivals(): Product[] {
  return products.filter((product) => product.isNew)
}

export function getProductById(id: number): Product | undefined {
  return products.find((product) => product.id === id)
}
