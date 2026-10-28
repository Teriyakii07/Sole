import { Link } from 'react-router-dom'
import { CartItemView } from '../components/Cart/CartItemView'
import { useCartController } from '../../controllers/cartControllers'
import { formatPrice } from '../../models/Cart'

export default function ShoppingCartView() {
  const {
    cart,
    inputQuantities,
    totalItems,
    subtotal,
    handleQuantityInputChange,
    updateQuantity,
    removeItem,
  } = useCartController()

  return (
    <main className="min-h-screen bg-white px-[2.8%] pt-6 pb-16 font-sans">

      {/* CART HEADER */}
      <div>
        <p className="mb-1 text-[18px] font-bold text-[#D7192D]">
          Your Bag
        </p>

        <h1 className="font-montserrat text-[40px] font-black tracking-tight text-black max-[600px]:text-[30px]">
          Shopping Cart
        </h1>

        <p className="mt-1 text-[15px] text-gray-500">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {/* DIVIDER */}
      <hr className="mt-6 border-0 border-t border-gray-200" />

      {cart.length === 0 ? (

        /* EMPTY CART */
        <div className="flex flex-col items-center pt-[155px] text-center max-[600px]:pt-[110px]">

          {/* BAG ICON */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="54"
            height="54"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#999999"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="7" width="18" height="15" rx="1.5" />
            <path d="M7 7V5a5 5 0 0 1 10 0v2" />
            <path d="M12 12v3" />
          </svg>

          <h2 className="mt-6 font-montserrat text-[24px] font-bold text-black">
            Your cart is empty
          </h2>

          <p className="mt-2 text-[18px] text-gray-500">
            Find your next pair from our latest drops.
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex h-[57px] items-center justify-center rounded-[3px] bg-[#173B8C] px-[29px] text-[16px] font-bold text-white no-underline transition-colors hover:bg-[#0B2B6D]"
          >
            START SHOPPING
          </Link>
        </div>

      ) : (

        /* CART WITH ITEMS */
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">

          {/* CART ITEMS */}
          <section className="lg:col-span-2">
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
          <aside className="h-fit rounded-[4px] border border-gray-200 bg-white p-6">

            <h2 className="mb-6 font-montserrat text-[22px] font-bold text-black">
              Order Summary
            </h2>

            <div className="mb-4 flex justify-between text-sm">
              <span className="text-gray-500">Total items</span>
              <span className="font-semibold">{totalItems}</span>
            </div>

            <div className="mb-5 flex justify-between border-b border-gray-200 pb-5">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="mb-5 text-[13px] leading-relaxed text-gray-500">
              Shipping and other charges are calculated at checkout.
            </p>

            <button
              type="button"
              onClick={() => alert('Checkout is not implemented yet.')}
              className="w-full cursor-pointer rounded-[3px] bg-[#173B8C] px-5 py-[14px] font-bold text-white transition-colors hover:bg-[#0B2B6D]"
            >
              PROCEED TO CHECKOUT
            </button>

            <Link
              to="/shop"
              className="mt-5 block text-center text-sm font-semibold text-[#173B8C] hover:underline"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  )
}