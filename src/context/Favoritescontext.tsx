import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getProductImageUrl } from '../controllers/productImageController';
import { useAuth } from './AuthContext';
import type { Product } from '../models/Product';

interface FavoriteRow {
  created_at: string;
  product: {
    id: string;
    name: string;
    image_url: string | null;
    category: { name: string } | null;
    product_variants: { price: number | string; is_active: boolean }[];
  } | null;
}

interface FavoritesContextType {
  favorites: Product[];
  loading: boolean;
  isFavorite: (id: string | number) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (!user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    supabase
      .from('favorites')
      .select(
        `created_at,
         product:products (
           id, name, image_url,
           category:categories ( name ),
           product_variants ( price, is_active )
         )`
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          console.error('Unable to load favorites:', error);
          setFavorites([]);
        } else {
          const rows = (data ?? []) as unknown as FavoriteRow[];
          setFavorites(
            rows
              .filter((row) => row.product)
              .map((row) => {
                const p = row.product!;
                const prices = p.product_variants
                  .filter((v) => v.is_active)
                  .map((v) => Number(v.price));
                return {
                  id: p.id,
                  name: p.name,
                  image: getProductImageUrl(p.image_url),
                  category: p.category?.name ?? '',
                  price: prices.length > 0 ? Math.min(...prices) : 0,
                };
              })
          );
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => String(f.id))),
    [favorites]
  );

  const isFavorite = useCallback(
    (id: string | number) => favoriteIds.has(String(id)),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (product: Product) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const productId = String(product.id);

      if (favoriteIds.has(productId)) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          console.error('Unable to remove favorite:', error);
          return;
        }
        setFavorites((prev) => prev.filter((f) => String(f.id) !== productId));
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: productId });

        if (error) {
          console.error('Unable to add favorite:', error);
          return;
        }
        setFavorites((prev) => [{ ...product, id: productId }, ...prev]);
      }
    },
    [user, favoriteIds, navigate]
  );

  const value = useMemo(
    () => ({ favorites, loading, isFavorite, toggleFavorite }),
    [favorites, loading, isFavorite, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider.');
  return context;
}