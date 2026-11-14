
export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
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
