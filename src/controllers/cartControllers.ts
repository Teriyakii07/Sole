import { useState } from 'react';
import { CartItem, initialCartData, calculateTotalItems, calculateSubtotal } from '../models/Cart';

export function useCartController() {
  const [cart, setCart] = useState<CartItem[]>(initialCartData);
  const [inputQuantities, setInputQuantities] = useState<Record<string, number | string>>(
    initialCartData.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})
  );

  const handleQuantityInputChange = (id: string, value: string): void => {
    setInputQuantities((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const updateQuantity = (id: string): void => {
    const qty = parseInt(String(inputQuantities[id]), 10);
    if (isNaN(qty) || qty <= 0) {
      removeItem(id);
    } else {
      const validQty = Math.min(qty, 99);
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id ? { ...item, quantity: validQty } : item
        )
      );
      setInputQuantities((prev) => ({ ...prev, [id]: validQty }));
    }
  };

  const removeItem = (id: string): void => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    setInputQuantities((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  return {
    cart,
    inputQuantities,
    totalItems: calculateTotalItems(cart),
    subtotal: calculateSubtotal(cart),
    handleQuantityInputChange,
    updateQuantity,
    removeItem,
  };
}