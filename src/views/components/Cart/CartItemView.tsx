import type { CartItem } from '../../../models/Cart'
import { formatPrice } from '../../../models/Cart'

interface CartItemViewProps {
  item: CartItem
  inputQuantity: number | string
  onQuantityChange: (id: string, value: string) => void
  onUpdate: (id: string) => void
  onRemove: (id: string) => void
}

export const CartItemView = ({
  item,
  inputQuantity,
  onQuantityChange,
  onUpdate,
  onRemove,
}: CartItemViewProps) => {
  return (
    <div className="flex flex-wrap items-start gap-4 border-b border-gray-200 py-6 sm:flex-nowrap">

      {/* PRODUCT IMAGE */}
      <img
        src={item.image}
        alt={item.name}
        className="h-[90px] w-[90px] shrink-0 rounded-[4px] bg-gray-100 object-contain sm:h-[130px] sm:w-[130px]"
      />

      {/* PRODUCT DETAILS */}
      <div className="min-w-0 flex-1">

        <h2 className="mb-2 font-montserrat text-[15px] font-bold text-black">
          {item.name}
        </h2>

        <p className="mb-4 text-sm font-bold text-black">
          {formatPrice(item.price)}
        </p>

        {/* QUANTITY */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label
            htmlFor={`qty-${item.id}`}
            className="text-xs text-gray-600"
          >
            Quantity:
          </label>

          <input
            type="number"
            id={`qty-${item.id}`}
            value={inputQuantity}
            onChange={(e) => onQuantityChange(item.id, e.target.value)}
            min="0"
            max="99"
            className="w-[60px] rounded-[3px] border border-gray-300 bg-white p-2 text-sm outline-none focus:border-[#173B8C]"
          />

          <button
            type="button"
            onClick={() => onUpdate(item.id)}
            className="cursor-pointer rounded-[3px] bg-[#173B8C] px-4 py-[9px] text-xs font-bold text-white hover:bg-[#0B2B6D]"
          >
            UPDATE
          </button>
        </div>

        {/* REMOVE */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-[#D7192D] hover:underline"
        >
          Remove
        </button>
      </div>

      {/* ITEM TOTAL */}
      <p className="ml-auto whitespace-nowrap text-sm font-bold text-black">
        {formatPrice(item.price * item.quantity)}
      </p>
    </div>
  )
}