
import type { CartItem } from '../../../models/Cart';
import { formatPrice } from '../../../models/Cart';

interface CartItemViewProps {
  item: CartItem;
  inputQuantity: number | string;
  onQuantityChange: (id: string, value: string) => void;
  onUpdate: (id: string) => void;
  onRemove: (id: string) => void;
}

export const CartItemView = ({
  item,
  onQuantityChange,
  onRemove,
}: CartItemViewProps) => {
  const maxQuantity = item.stock > 0 ? Math.min(99, item.stock) : 99

  return (
    <div className="flex flex-wrap items-start gap-4 border-b border-gray-200 py-6 sm:flex-nowrap">

      {/* PRODUCT IMAGE */}
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="h-[90px] w-[90px] shrink-0 rounded-[4px] bg-gray-100 object-contain sm:h-[130px] sm:w-[130px]"
          onError={handleImageError}
        />
      ) : (
        <div className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-[4px] bg-gray-100 text-gray-300 sm:h-[130px] sm:w-[130px]">
          <ImageIcon aria-hidden="true" size={32} />
        </div>
      )}

      {/* PRODUCT DETAILS */}
      <div className="min-w-0 flex-1">

        <h2 className="mb-1 font-montserrat text-[15px] font-bold text-black">
          {item.name}
        </h2>

        <p className="mb-2 text-sm font-bold text-black">
          {formatPrice(item.price)}
        </p>

        {/* SELECTED SHOE SIZE */}
        <p className="mb-3 text-sm text-gray-600">
          Size: <span className="font-semibold text-black">
            {item.size ? `US ${item.size}` : 'Not selected'}
          </span>
        </p>

        {/* QUANTITY */}
        <div className="mb-3 flex items-center gap-3">
          <span className="text-xs text-gray-600">Quantity:</span>
          <div className="flex items-center rounded-[3px] border border-gray-300">
            <button
            type="button"
              aria-label={`Decrease quantity of ${item.name}`}
              disabled={item.quantity <= 1}
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              className="px-3 py-1 text-lg font-bold text-[#173B8C] disabled:cursor-not-allowed disabled:text-gray-300"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity of ${item.name}`}
              disabled={item.quantity >= maxQuantity}
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="px-3 py-1 text-lg font-bold text-[#173B8C] disabled:cursor-not-allowed disabled:text-gray-300"
            >
              +
            </button>
          </div>
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
  );
};
