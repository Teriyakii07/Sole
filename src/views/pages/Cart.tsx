
import { Link } from 'react-router-dom';
import { CartItemView } from '../components/Cart/CartItemView';
import { useCartController } from '../../controllers/cartControllers';
import { formatPrice } from '../../models/Cart';

export default function ShoppingCartView() {
  const {
    cart,
    inputQuantities,
    totalItems,
    subtotal,
    handleQuantityInputChange,
    updateQuantity,
    removeItem,
  } = useCartController();

  const shippingFee = subtotal >= 3000 ? 0 : 150;
  const total = subtotal + shippingFee;

  return (
    <main className="min-h-screen bg-[#F5F6FA] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-8 text-3xl font-bold text-[#123A8C]">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="rounded-lg bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Cart is Empty
            </h2>

            <p className="mt-3 text-gray-500">
              Looks like you haven't added anything to your bag yet.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-block bg-[#123A8C] px-8 py-3 font-bold text-white transition hover:bg-[#D7192D]"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

            {/* CART ITEMS */}
            <section className="rounded-lg bg-white p-5 shadow-sm sm:p-8 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Your Items
                </h2>

                <span className="text-sm text-gray-500">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>

              {cart.map((item) => (
                <CartItemView
                  key={item.id}
                  item={item}
                  inputQuantity={inputQuantities[item.id] ?? item.quantity}
                  onQuantityChange={handleQuantityInputChange}
                  onUpdate={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </section>

            {/* ORDER SUMMARY */}
            <aside className="h-fit rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-7 text-xl font-bold text-[#123A8C]">
                Order Summary
              </h2>

              <div className="space-y-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Items ({totalItems})
                  </span>
                  <span className="font-bold">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="font-bold">
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-[#123A8C]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-8 block w-full rounded-lg bg-[#123A8C] py-4 text-center font-bold text-white transition hover:bg-[#D7192D]"
              >
                PROCEED TO CHECKOUT
              </Link>

              <Link
                to="/shop"
                className="mt-4 block text-center text-sm font-semibold text-[#123A8C] hover:underline"
              >
                CONTINUE SHOPPING
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
