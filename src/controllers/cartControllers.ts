
import { useState, useEffect, useSyncExternalStore } from 'react';
import type { CartItem } from '../models/Cart';
import type { Product, ProductVariant } from '../models/Product';
import {
  calculateTotalItems,
  calculateSubtotal,
} from '../models/Cart';

const CART_STORAGE_KEY = 'sole-shopping-cart';

function loadCart(): CartItem[] {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) return [];

    const parsedCart: unknown = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) return [];

    // Remove old cart items that do not have variant IDs.
    return parsedCart.filter(
      (item): item is CartItem =>
        typeof item.id === 'string' &&
        typeof item.variantId === 'string' &&
        typeof item.productId === 'string' &&
        typeof item.quantity === 'number'
    );
  } catch {
    return [];
  }
}

let cartItems: CartItem[] = loadCart();

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}

function getCart() {
  return cartItems;
}

function saveCart(newCart: CartItem[]) {
  cartItems = newCart;

  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  } catch (error) {
    console.error('Unable to save cart:', error);
  }

  listeners.forEach((callback) => callback());
}

export function useCartController() {
  const cart = useSyncExternalStore(
    subscribe,
    getCart,
    () => []
  );

  const [inputQuantities, setInputQuantities] = useState<
    Record<string, number | string>
  >({});

  useEffect(() => {
    setInputQuantities((previous) => {
      const updated: Record<string, number | string> = {};

      cart.forEach((item) => {
        updated[item.id] = previous[item.id] ?? item.quantity;
      });

      return updated;
    });
  }, [cart]);

  const addToCart = (
    product: Product,
    variant: ProductVariant,
    quantity: number = 1
  ): void => {
    const productId = String(product.id);
    const cartItemId = variant.id;

    const existingItem = cartItems.find(
      (item) => item.variantId === variant.id
    );

    if (existingItem) {
      saveCart(
        cartItems.map((item) =>
          item.variantId === variant.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        variantId: variant.id,
        productId,
        name: product.name,
        price: variant.price,
        image: product.image,
        quantity,
        size: variant.sizeLabel,
        color: variant.color,
      };

      saveCart([...cartItems, newItem]);
    }
  };

  const handleQuantityInputChange = (
    id: string,
    value: string
  ): void => {
    setInputQuantities((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  const updateQuantity = (id: string): void => {
    const qty = parseInt(String(inputQuantities[id]), 10);

    if (isNaN(qty) || qty <= 0) {
      removeItem(id);
      return;
    }

    const validQty = Math.min(qty, 99);

    saveCart(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: validQty }
          : item
      )
    );

    setInputQuantities((previous) => ({
      ...previous,
      [id]: validQty,
    }));
  };

  const removeItem = (id: string): void => {
    saveCart(cartItems.filter((item) => item.id !== id));

    setInputQuantities((previous) => {
      const updated = { ...previous };
      delete updated[id];
      return updated;
    });
  };

  return {
    cart,
    inputQuantities,
    totalItems: calculateTotalItems(cart),
    subtotal: calculateSubtotal(cart),
    addToCart,
    handleQuantityInputChange,
    updateQuantity,
    removeItem,
  };
}
