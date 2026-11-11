
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
  size?: string;
}

export const calculateTotalItems = (cart: CartItem[]) =>
  cart.reduce((total, item) => total + item.quantity, 0);

export const calculateSubtotal = (cart: CartItem[]) =>
  cart.reduce((total, item) => total + item.price * item.quantity, 0);

export const formatPrice = (price: number) =>
  price.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  });
