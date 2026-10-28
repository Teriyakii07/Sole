export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export const initialCartData: CartItem[] = [
  {
    id: '1',
    name: 'Air Jordan 1 Retro High OG',
    price: 9895.00,
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=400',
    quantity: 1,
  },
  {
    id: '2',
    name: 'Nike Dunk Low Retro',
    price: 5495.00,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=400',
    quantity: 2,
  },
];

export const calculateTotalItems = (cart: CartItem[]): number =>
  cart.reduce((sum, item) => sum + item.quantity, 0);

export const calculateSubtotal = (cart: CartItem[]): number =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const formatPrice = (amount: number): string =>
  `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;