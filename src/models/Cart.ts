export interface CartItem {
  id: string;        // cart_items.id
  variantId: string; // product_variants.id
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  stock: number;
}

export const calculateTotalItems = (cart: CartItem[]): number =>
  cart.reduce((sum, item) => sum + item.quantity, 0);

export const calculateSubtotal = (cart: CartItem[]): number =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const formatPrice = (amount: number): string =>
  `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;