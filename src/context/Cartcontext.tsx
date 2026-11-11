import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getProductImageUrl } from '../controllers/productImageController';
import { useAuth } from './AuthContext';
import {
  type CartItem,
  calculateTotalItems,
  calculateSubtotal,
} from '../models/Cart';

interface CartRow {
  id: string;
  quantity: number;
  created_at: string;
  variant: {
    id: string;
    size_label: string;
    size_system: string;
    color: string;
    price: number | string;
    stock_quantity: number;
    product: {
      id: string;
      name: string;
      image_url: string | null;
    } | null;
  } | null;
}

interface CartRecord {
  id: string;
  cart_items: CartRow[];
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  totalItems: number;
  subtotal: number;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function mapRows(rows: CartRow[]): CartItem[] {
  return [...rows]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .filter((row) => row.variant && row.variant.product)
    .map((row) => {
      const v = row.variant!;
      return {
        id: row.id,
        variantId: v.id,
        productId: v.product!.id,
        name: v.product!.name,
        image: getProductImageUrl(v.product!.image_url),
        size: `${v.size_system} ${v.size_label}`,
        color: v.color,
        price: Number(v.price),
        quantity: row.quantity,
        stock: v.stock_quantity,
      };
    });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const cartIdRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      cartIdRef.current = null;
      setCart([]);
      return;
    }

    const { data, error } = await supabase
      .from('carts')
      .select(
        `id,
         cart_items (
           id, quantity, created_at,
           variant:product_variants (
             id, size_label, size_system, color, price, stock_quantity,
             product:products ( id, name, image_url )
           )
         )`
      )
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Unable to load cart:', error);
      return;
    }

    const record = data as unknown as CartRecord | null;
    cartIdRef.current = record?.id ?? null;
    setCart(mapRows(record?.cart_items ?? []));
  }, [user]);

  useEffect(() => {
    setLoading(true);
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const ensureCartId = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    if (cartIdRef.current) return cartIdRef.current;

    const { data, error } = await supabase
      .from('carts')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Unable to create cart:', error);
      return null;
    }

    cartIdRef.current = data.id as string;
    return cartIdRef.current;
  }, [user]);

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const cartId = await ensureCartId();
      if (!cartId) return;

      const existing = cart.find((i) => i.variantId === variantId);
      const max = existing && existing.stock > 0 ? Math.min(99, existing.stock) : 99;
      const newQty = Math.min((existing?.quantity ?? 0) + quantity, max);

      const { error } = await supabase.from('cart_items').upsert(
        { cart_id: cartId, variant_id: variantId, quantity: newQty },
        { onConflict: 'cart_id,variant_id' }
      );

      if (error) {
        console.error('Unable to add to cart:', error);
        return;
      }

      await refresh();
    },
    [user, cart, navigate, ensureCartId, refresh]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.error('Unable to remove item:', error);
        return;
      }
      setCart((prev) => prev.filter((i) => i.id !== cartItemId));
    },
    []
  );

  const setQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(cartItemId);
        return;
      }

      const item = cart.find((i) => i.id === cartItemId);
      const max = item && item.stock > 0 ? Math.min(99, item.stock) : 99;
      const validQty = Math.min(quantity, max);

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: validQty })
        .eq('id', cartItemId);

      if (error) {
        console.error('Unable to update quantity:', error);
        return;
      }
      setCart((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity: validQty } : i))
      );
    },
    [cart, removeItem]
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      totalItems: calculateTotalItems(cart),
      subtotal: calculateSubtotal(cart),
      addToCart,
      setQuantity,
      removeItem,
    }),
    [cart, loading, addToCart, setQuantity, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}