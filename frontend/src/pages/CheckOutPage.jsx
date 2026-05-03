import { useEffect, useState } from "react";
import { API } from "../api/api";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);

    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const shippingCharge =
    pinCode.length < 6
      ? null
      : state.toLowerCase() === "gujarat"
      ? 0
      : total >= 3000
      ? 0
      : 99;

  const grandTotal = total + (shippingCharge || 0);

  const saveOrderToAdmin = async (paymentStatus = "Pending") => {
    const newOrder = {
      customerName: "Customer",
      email: "",
      phone: "",

      products: cart.map((item) => ({
        productId: item._id || item.id,
        name: item.name || item.title,
        title: item.title || item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity || 1,
        size: item.size,
      })),

      total: grandTotal,
      items: cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0),

      paymentMethod,
      paymentStatus,
      status: paymentStatus === "Paid" ? "Processing" : "COD Pending",

      address: {
        city,
        state,
        pinCode,
      },
    };

    await API.post("/orders", newOrder);
  };

  const removeFromCart = (itemToRemove) => {
    const updatedCart = cart.filter(
      (item) =>
        !(
          String(item.id || item._id || item.name || item.title) ===
            String(
              itemToRemove.id ||
                itemToRemove._id ||
                itemToRemove.name ||
                itemToRemove.title
            ) && item.size === itemToRemove.size
        )
    );

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

     const { data: order } = await API.post("/payment/create-order", {
  amount: grandTotal,
});

      const options = {
        key: "rzp_test_SkAzOkzr0VpjvT",
        amount: order.amount,
        currency: order.currency,
        name: "TrendyThreads",
        description: "Order Payment",
        order_id: order.id,

        handler: async function () {
          await saveOrderToAdmin("Paid");

          alert("Payment successful!");

          localStorage.removeItem("cart");
          localStorage.removeItem("checkout");

          setCart([]);
          window.dispatchEvent(new Event("cartUpdated"));

          window.location.href = "/";
        },

        theme: {
          color: "#8A5A5D",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Payment failed. Please try again.");
    }
  };

  const handleCODOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      await saveOrderToAdmin("COD");

      alert("COD order placed!");

      localStorage.removeItem("cart");
      localStorage.removeItem("checkout");

      setCart([]);
      window.dispatchEvent(new Event("cartUpdated"));

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Failed to place order");
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Contact</h2>

            <a
              href="/login"
              className="text-sm underline text-[#111] hover:text-[#8A5A5D]"
            >
              Sign in
            </a>
          </div>

          <input
            placeholder="Email or mobile phone number"
            className="w-full border border-[#D9D9D9] rounded-md p-3 mb-6 focus:outline-none focus:border-[#111]"
          />

          <h2 className="text-xl font-semibold mb-4">Delivery</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              placeholder="First name"
              className="border border-[#D9D9D9] p-3 rounded-md focus:outline-none focus:border-[#111]"
            />
            <input
              placeholder="Last name"
              className="border border-[#D9D9D9] p-3 rounded-md focus:outline-none focus:border-[#111]"
            />
          </div>

          <input
            placeholder="Address"
            className="border border-[#D9D9D9] p-3 w-full mb-4 rounded-md focus:outline-none focus:border-[#111]"
          />

          <div className="grid grid-cols-3 gap-4 mb-4">
            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border border-[#D9D9D9] p-3 rounded-md focus:outline-none focus:border-[#111]"
            />

            <input
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="border border-[#D9D9D9] p-3 rounded-md focus:outline-none focus:border-[#111]"
            />

            <input
              placeholder="PIN code"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="border border-[#D9D9D9] p-3 rounded-md focus:outline-none focus:border-[#111]"
            />
          </div>

          <input
            placeholder="Phone"
            className="border border-[#D9D9D9] p-3 w-full mb-6 rounded-md focus:outline-none focus:border-[#111]"
          />

          <h2 className="text-xl font-semibold mb-4 text-[#3B0010]">
            Payment
          </h2>

          <div className="border border-[#D9D9D9] rounded-md overflow-hidden mb-6">
            <label
              className={`flex items-start justify-between gap-4 p-4 cursor-pointer ${
                paymentMethod === "razorpay"
                  ? "border border-black bg-[#fafafa]"
                  : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="mt-1 accent-black"
                />

                <span className="text-[#111] leading-6">
                  Razorpay Secure (UPI, Cards, Wallets)
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="border border-[#D9D9D9] rounded px-2 py-1 text-xs font-bold">
                  UPI
                </span>
                <span className="border border-[#D9D9D9] rounded px-2 py-1 text-xs font-bold text-blue-700">
                  VISA
                </span>
                <span className="border border-[#D9D9D9] rounded px-2 py-1 text-xs font-bold text-red-500">
                  MC
                </span>
              </div>
            </label>

            {paymentMethod === "razorpay" && (
              <div className="bg-[#F4F4F4] border-t border-[#D9D9D9] px-6 py-4 text-sm text-center text-[#333]">
                You’ll be redirected to Razorpay Secure to complete your
                payment.
              </div>
            )}

            <label
              className={`flex items-center gap-3 p-4 border-t border-[#D9D9D9] cursor-pointer ${
                paymentMethod === "cod" ? "border border-black bg-[#fafafa]" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="accent-black"
              />

              <span className="text-[#111]">Cash on Delivery (COD)</span>
            </label>
          </div>

          <button
            onClick={
              paymentMethod === "razorpay"
                ? handleRazorpayPayment
                : handleCODOrder
            }
            className="w-full bg-[#8A5A5D] text-white py-4 font-bold rounded-md hover:bg-[#70464A] transition"
          >
            {paymentMethod === "razorpay" ? "Pay now" : "Place order"}
          </button>
        </div>

        <div className="bg-[#F7F7F7] p-8 h-fit border-l border-[#E5E5E5]">
          {cart.map((item, index) => (
            <div
              key={`${item.id || item._id || item.name}-${item.size}-${index}`}
              className="flex items-start gap-4 mb-7"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title || item.name}
                  className="w-20 h-24 object-cover rounded-xl border bg-white"
                />

                <span className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {item.quantity || 1}
                </span>
              </div>

              <div className="flex-1 pt-2">
                <p className="text-sm text-[#111]">
                  {item.title || item.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Size: {item.size}
                </p>

                <button
                  onClick={() => removeFromCart(item)}
                  className="mt-2 text-xs underline text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>

              <p className="text-sm font-medium text-[#111]">
                ₹
                {(
                  Number(item.price || 0) * Number(item.quantity || 1)
                ).toLocaleString("en-IN")}
                .00
              </p>
            </div>
          ))}

          <div className="flex gap-4 mb-8">
            <input
              placeholder="Discount code or gift card"
              className="flex-1 border border-[#D9D9D9] rounded-md px-4 py-3 bg-white focus:outline-none focus:border-[#111]"
            />

            <button className="border border-[#D9D9D9] px-5 rounded-md bg-[#eee] text-gray-600">
              Apply
            </button>
          </div>

          <div className="space-y-3 text-[#111]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}.00</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-gray-500">
                {shippingCharge === null
                  ? "Enter shipping address"
                  : shippingCharge === 0
                  ? "Free"
                  : `₹${shippingCharge}.00`}
              </span>
            </div>

            <div className="flex justify-between pt-3 items-end border-t">
              <span className="text-xl font-semibold">Total</span>

              <span className="text-xl font-bold">
                <span className="text-xs text-gray-500 mr-2">INR</span>₹
                {grandTotal.toLocaleString("en-IN")}.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
