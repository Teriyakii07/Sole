
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartController } from '../../controllers/cartControllers';
import { useProfileController } from '../../controllers/profileControllers';
import { formatPrice } from '../../models/Cart';
import { supabase } from '../../lib/supabaseClient';

export default function Checkout() {
  const { cart, totalItems, subtotal, removeItem } = useCartController();

  const {
    profile,
    addresses,
    loading,
    error,
  } = useProfileController();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderError, setOrderError] = useState('');

  // STORE PURCHASED ITEMS FOR CONFIRMATION DISPLAY
  const [purchasedItems, setPurchasedItems] = useState<typeof cart>([]);
  const [purchasedOrderNumber, setPurchasedOrderNumber] = useState('');

  const shippingFee = subtotal >= 3000 ? 0 : 150;
  const total = subtotal + shippingFee;

  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ||
    addresses.find((address) => address.is_default) ||
    addresses[0];

  async function handlePlaceOrder(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setOrderMessage('');
    setOrderError('');

    if (cart.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    if (!selectedAddress) {
      setOrderError(
        'Please add a delivery address to your profile first.'
      );
      return;
    }

    setPlacingOrder(true);

    let orderId: string | null = null;

    try {
      // GET SIGNED-IN USER
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error('Please log in before placing your order.');
      }

      // GENERATE ORDER NUMBER
      const orderNumber =
        `SOLE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // SAVE ORDER
      const { data: order, error: orderInsertError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          address_id: selectedAddress.id,
          recipient_name: selectedAddress.recipient_name,
          recipient_phone: selectedAddress.phone_number,
          address_line: selectedAddress.address_line,
          address_line_2: selectedAddress.address_line_2 || null,
          barangay: selectedAddress.barangay,
          city: selectedAddress.city,
          province: selectedAddress.province,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country,
          subtotal,
          shipping_fee: shippingFee,
          discount_amount: 0,
          total_amount: total,
          status: 'pending',
          notes: `Payment method: ${
            paymentMethod === 'cod'
              ? 'Cash on Delivery'
              : 'PayMongo'
          }`,
        })
        .select('id')
        .single();

      if (orderInsertError) throw orderInsertError;

      orderId = order.id;

      // SAVE PURCHASED ITEMS
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        variant_id: null,
        product_name: item.name,
        sku: null,
        size_label: item.size || null,
        color: null,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsInsertError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsInsertError) throw itemsInsertError;

      // SAVE ITEMS FOR CONFIRMATION DISPLAY
      setPurchasedItems([...cart]);
      setPurchasedOrderNumber(orderNumber);

      // SHOW CONFIRMATION MESSAGE IMMEDIATELY
      setOrderMessage(
        `Your order ${orderNumber} has been successfully placed! Your confirmation email is being processed.`
      );

      // REMOVE PURCHASED ITEMS FROM CART
      cart.forEach((item) => {
        removeItem(item.id);
      });

      // SEND ORDER CONFIRMATION EMAIL
      const { data: emailResult, error: emailError } =
        await supabase.functions.invoke(
          'send-order-confirmation',
          {
            body: {},
          }
        );

      if (emailError || !emailResult?.success) {
        console.error(
          'Order confirmation email error:',
          emailError || emailResult
        );

        setOrderMessage(
          `Your order ${orderNumber} was saved successfully, but the confirmation email could not be sent.`
        );

        return;
      }

      setOrderMessage(
        `Your order ${orderNumber} has been successfully purchased! A confirmation email has been sent to ${user.email}.`
      );

    } catch (err: unknown) {
      console.error('Checkout error:', err);

      // SHOW THE ACTUAL ERROR
      let errorMessage = 'Unknown error. Please check the browser console.';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object') {
        const supabaseError = err as {
          message?: string;
          details?: string;
          hint?: string;
          code?: string;
        };

        errorMessage = [
          supabaseError.message,
          supabaseError.details,
          supabaseError.hint
            ? `Hint: ${supabaseError.hint}`
            : '',
          supabaseError.code
            ? `Error code: ${supabaseError.code}`
            : '',
        ]
          .filter(Boolean)
          .join(' | ');
      }

      // REMOVE INCOMPLETE ORDER IF ITEM SAVING FAILED
      if (orderId) {
        const { error: deleteError } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (deleteError) {
          console.error(
            'Unable to remove incomplete order:',
            deleteError
          );
        }
      }

      setOrderError(errorMessage);

    } finally {
      setPlacingOrder(false);
    }
  }

  // PURCHASE CONFIRMATION ON THE SAME CHECKOUT PAGE
  // CHECK ORDER NUMBER, NOT EMAIL MESSAGE
  if (purchasedOrderNumber) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-10">
            <div className="text-5xl text-green-600 mb-4">
              ✓
            </div>

            <h1 className="text-3xl font-bold text-[#123A8C]">
              Order Purchased!
            </h1>

            <p className="text-gray-600 mt-3">
              {orderMessage}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Order Number:{' '}
              <strong className="text-gray-800">
                {purchasedOrderNumber}
              </strong>
            </p>
          </div>

          <section className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#123A8C] mb-6">
              Purchased Items
            </h2>

            <div className="divide-y">
              {purchasedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover bg-gray-100 rounded"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                      Size: {item.size
                        ? `US ${item.size}`
                        : 'Not selected'}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Quantity: {item.quantity}
                    </p>

                    <p className="font-bold text-[#123A8C] mt-2">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="text-center mt-8">
            <p className="text-gray-500 mb-6">
              Thank you for shopping with SOLE. Step Into Style!
            </p>

            <Link
              to="/shop"
              className="inline-block bg-[#123A8C] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#D7192D] transition"
            >
              CONTINUE SHOPPING
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // EMPTY CART (ONLY WHEN THERE IS NO COMPLETED PURCHASE)
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6FA]">
        <h1 className="text-3xl font-bold text-[#123A8C] mb-3">
          Your Cart is Empty
        </h1>

        <p className="text-gray-500 mb-6">
          Add some sneakers before checking out.
        </p>

        <Link
          to="/shop"
          className="bg-[#123A8C] text-white px-8 py-3 font-bold"
        >
          START SHOPPING
        </Link>
      </div>
    );
  }

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading your delivery information...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        <Link
          to="/cart"
          className="text-sm text-gray-500 hover:text-[#123A8C]"
        >
          ← Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-[#123A8C] mt-5 mb-8">
          Checkout
        </h1>

        <form onSubmit={handlePlaceOrder}>

          {/* ORDER ERROR MESSAGE */}
          {orderError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">
                Unable to place your order.
              </p>

              <p className="text-sm text-red-600 mt-2 break-words">
                {orderError}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* CHECKOUT DETAILS */}
            <div className="lg:col-span-2 space-y-8">

              {/* 1. YOUR ITEMS */}
              <section className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6 text-[#123A8C]">
                  1. Your Items
                </h2>

                <div className="divide-y">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 py-5 first:pt-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover bg-gray-100 rounded"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.name}
                        </h3>

                        <p className="text-sm text-gray-500 mt-2">
                          Size: {item.size
                            ? `US ${item.size}`
                            : 'Not selected'}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Quantity: {item.quantity}
                        </p>

                        <p className="font-bold text-[#123A8C] mt-2">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/cart"
                  className="text-sm font-semibold text-[#123A8C] hover:text-[#D7192D]"
                >
                  EDIT CART →
                </Link>
              </section>

              {/* 2. DELIVERY INFORMATION */}
              <section className="border border-gray-200 rounded-lg p-6">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                  <h2 className="text-xl font-bold text-[#123A8C]">
                    2. Delivery Information
                  </h2>

                  <Link
                    to="/profile"
                    className="text-sm font-semibold text-[#123A8C] hover:text-[#D7192D]"
                  >
                    MANAGE PROFILE →
                  </Link>
                </div>

                {error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">
                      {error}
                    </p>

                    <Link
                      to="/login"
                      className="inline-block mt-3 text-sm font-bold text-[#123A8C]"
                    >
                      Go to Login →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#F5F6FA] rounded-lg p-4 mb-6">
                      <p className="text-sm font-bold text-gray-800 mb-3">
                        Customer Information
                      </p>

                      <p className="text-sm text-gray-600">
                        {profile.first_name} {profile.last_name}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        {profile.email}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        {profile.phone_number}
                      </p>
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-4">
                      Select Delivery Address
                    </h3>

                    {addresses.length === 0 ? (
                      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-sm text-gray-600">
                          You don't have a saved delivery address yet.
                        </p>

                        <Link
                          to="/profile"
                          className="inline-block mt-4 bg-[#123A8C] text-white px-5 py-3 rounded font-bold text-sm hover:bg-[#D7192D]"
                        >
                          ADD DELIVERY ADDRESS
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address) => {
                          const isSelected =
                            (selectedAddressId
                              ? selectedAddressId === address.id
                              : selectedAddress?.id === address.id);

                          return (
                            <label
                              key={address.id}
                              className={`block border rounded-lg p-4 cursor-pointer transition ${
                                isSelected
                                  ? 'border-[#123A8C] bg-[#F5F7FC]'
                                  : 'border-gray-200 hover:border-[#123A8C]'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="deliveryAddress"
                                  checked={isSelected}
                                  onChange={() =>
                                    setSelectedAddressId(address.id)
                                  }
                                  className="mt-1 accent-[#123A8C]"
                                />

                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-bold text-gray-900">
                                      {address.recipient_name}
                                    </p>

                                    {address.is_default && (
                                      <span className="text-xs bg-blue-100 text-[#123A8C] px-2 py-1 rounded">
                                        DEFAULT
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-sm text-gray-600 mt-2">
                                    {address.phone_number}
                                  </p>

                                  <p className="text-sm text-gray-600 mt-2 leading-6">
                                    {address.address_line}
                                    {address.address_line_2 &&
                                      `, ${address.address_line_2}`}
                                    {`, Barangay ${address.barangay}, ${address.city}, ${address.province}, ${address.postal_code}, ${address.country}`}
                                  </p>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* 3. PAYMENT METHOD */}
              <section className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6 text-[#123A8C]">
                  3. Payment Method
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#123A8C]">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#123A8C]"
                    />

                    <div>
                      <p className="font-semibold">
                        Cash on Delivery
                      </p>

                      <p className="text-sm text-gray-500">
                        Pay when your order arrives.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#123A8C]">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'paymongo'}
                      onChange={() => setPaymentMethod('paymongo')}
                      className="accent-[#123A8C]"
                    />

                    <div>
                      <p className="font-semibold">
                        PayMongo
                      </p>

                      <p className="text-sm text-gray-500">
                        Pay online using supported payment options.
                      </p>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* 4. ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-[#F5F6FA] border border-gray-200 rounded-xl p-6 sm:p-8 lg:sticky lg:top-8">

                <h2 className="text-2xl font-bold text-[#123A8C] mb-8">
                  Order Summary
                </h2>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      Items ({totalItems})
                    </span>

                    <span className="font-bold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      Shipping Fee
                    </span>

                    <span className="font-bold">
                      {shippingFee === 0
                        ? 'FREE'
                        : formatPrice(shippingFee)}
                    </span>
                  </div>

                  <div className="border-t border-gray-300 pt-6 flex justify-between items-center">
                    <span className="font-bold text-lg">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-[#123A8C]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    addresses.length === 0 ||
                    !!error ||
                    placingOrder
                  }
                  className="w-full bg-[#123A8C] text-white py-4 mt-8 rounded-lg font-bold text-lg hover:bg-[#D7192D] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placingOrder
                    ? 'PROCESSING ORDER...'
                    : 'PLACE ORDER'}
                </button>

                <Link
                  to="/cart"
                  className="block w-full text-center border border-[#123A8C] text-[#123A8C] py-4 mt-4 rounded-lg font-bold text-lg hover:bg-[#123A8C] hover:text-white transition"
                >
                  BACK TO CART
                </Link>

                <p className="text-center text-sm text-gray-500 mt-6">
                  Thank you for choosing SOLE. Step Into Style.
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
