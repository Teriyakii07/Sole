
import type { Product } from '../models/Product';

const FAVORITES_KEY = 'sole_favorites';
const FAVORITES_EVENT = 'sole-favorites-updated';

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}
export function getFavorites(): FavoriteItem[] {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) as FavoriteItem[] : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: FavoriteItem[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

export function isFavorite(id: string | number): boolean {
  return getFavorites().some(item => item.id === String(id));
}

export function toggleFavorite(product: Product): boolean {
  const favorites = getFavorites();
  const productId = String(product.id);

  const alreadyFavorite = favorites.some(
    item => item.id === productId
  );

  const updated = alreadyFavorite
    ? favorites.filter(item => item.id !== productId)
    : [
        ...favorites,
        {
          id: productId,
          name: product.name,
          price: product.price,
          image: product.image,
        },
      ];

  saveFavorites(updated);

  return !alreadyFavorite;
}

export function removeFavorite(id: string) {
  const updated = getFavorites().filter(item => item.id !== id);
  saveFavorites(updated);
}

export function subscribeToFavorites(callback: () => void) {
  window.addEventListener(FAVORITES_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(FAVORITES_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
