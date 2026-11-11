import { useCart } from '../context/Cartcontext';

export function useCartController() {
  const { cart, totalItems, subtotal, setQuantity, removeItem } = useCart();

  const changeQuantity = (id: string, quantity: number): void => {
    const item = cart.find((cartItem) => cartItem.id === id);
    if (!item) return;

    const max = item.stock > 0 ? Math.min(99, item.stock) : 99;
    void setQuantity(id, Math.min(max, Math.max(1, quantity)));
  };

  return {
    cart,
    totalItems,
    subtotal,
    changeQuantity,
    removeItem: (id: string) => void removeItem(id),
  };
}