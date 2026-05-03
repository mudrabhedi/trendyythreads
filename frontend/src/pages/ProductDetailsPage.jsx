import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import { API } from "../api/api";

const sizes = ["L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL"];

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function ProductDetailsPage() {
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  const navigate = useNavigate();
  const { slug } = useParams();

  const [products, setProducts] = useState([]);
const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
  const loadProductData = async () => {
    try {
      const productRes = await API.get(`/products/${slug}`);
      const productsRes = await API.get("/products");

      setProduct(productRes.data);
      setProducts(productsRes.data.filter((p) => p.status !== "Hidden"));
      setMainImage(productRes.data.image);
    } catch (error) {
      toast.error("Product not found");
    }
  };

  loadProductData();
}, [slug]);

  useEffect(() => {
    if (product) {
      setMainImage(product.image);
      const firstAvailable = sizes.find(
        (size) =>
          product.sizes?.some(
            (s) => s.size === size && Number(s.stock) > 0
          )
      );

      setSelectedSize(firstAvailable || "");
      setQty(1);
    }
  }, [product]);

  const getSizeStock = (size) => {
    const found = product?.sizes?.find((s) => s.size === size);
    return found ? Number(found.stock) : 0;
  };

  const selectedStock = selectedSize ? getSizeStock(selectedSize) : 0;

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error("Please select an available size");
      return;
    }

    if (qty > selectedStock) {
      toast.error(`Only ${selectedStock} available`);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartItem = {
  ...product,
  id: product._id || product.id,
  size: selectedSize,
  quantity: qty,
};

const existingIndex = cart.findIndex(
  (item) =>
    String(item._id || item.id) === String(product._id || product.id) &&
    item.size === selectedSize
);

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
  if (!selectedSize) {
    toast.error("Please select a size");
    return;
  }

  if (selectedStock <= 0) {
    toast.error("Out of stock");
    return;
  }

  if (qty > selectedStock) {
    toast.error(`Only ${selectedStock} available`);
    return;
  }

  const buyNowItem = {
    ...product,
    size: selectedSize,
    quantity: qty,
  };

  const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItemIndex = existingCart.findIndex(
    (item) =>
      String(item.name || item.title) === String(product.name || product.title) &&
      item.size === selectedSize
  );

  if (existingItemIndex !== -1) {
    existingCart[existingItemIndex].quantity += qty;
  } else {
    existingCart.push(buyNowItem);
  }

  localStorage.setItem("cart", JSON.stringify(existingCart));
  localStorage.setItem("checkout", JSON.stringify([buyNowItem]));

  window.dispatchEvent(new Event("cartUpdated"));

  window.scrollTo(0, 0);
  navigate("/checkout");
};

const handleWishlist = () => {
  const isLoggedIn =
    localStorage.getItem("user") ||
    localStorage.getItem("token") ||
    localStorage.getItem("loggedInUser");

  if (!isLoggedIn) {
    toast.error("Please login or sign up to add wishlist");
    return;
  }

  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  const exists = wishlist.some(
    (item) =>
      String(item.name || item.title) === String(product.name || product.title)
  );

  if (exists) {
    const updatedWishlist = wishlist.filter(
      (item) =>
        String(item.name || item.title) !== String(product.name || product.title)
    );

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
    toast("Removed from wishlist");
    return;
  }

  const wishlistProduct = {
    title: product.title || product.name,
    name: product.name || product.title,
    price: product.price,
    oldPrice: product.oldPrice,
    image: product.image,
    href: product.href,
    category: product.category,
  };

  localStorage.setItem(
    "wishlist",
    JSON.stringify([...wishlist, wishlistProduct])
  );

  window.dispatchEvent(new Event("wishlistUpdated"));
  toast.success("Added to wishlist");
};

  const handleCardAddToCart = (cartProduct) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(cartProduct);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Added to cart");
  };

  const sameCategoryProducts = useMemo(() => {
    if (!product) return [];

    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.category?.toLowerCase() === product.category?.toLowerCase()
      )
      .slice(0, 8);
  }, [products, product]);

  const bestsellerProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.id !== product?.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
  }, [products, product]);

  if (!product) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center text-gray-500">
        Product not found.
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="max-w-[1500px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-12 items-start">
          
<div className="bg-[#F7EFEA] flex items-center justify-center min-h-[760px]">
  <img
    src={mainImage}
    alt={product.title || product.name}
    className="w-full h-[760px] object-contain"
  />
</div>

          <div className="pt-8 max-w-[560px]">
            <h1 className="text-3xl font-medium text-[#111]">
              {product.title || product.name}
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-bold text-[#111]">
                Rs. {Number(product.price).toLocaleString("en-IN")}
              </span>

              {product.oldPrice && (
                <span className="text-gray-500 line-through text-lg">
                  Rs. {Number(product.oldPrice).toLocaleString("en-IN")}
                </span>
              )}

              {product.oldPrice && (
                <span className="bg-green-700 text-white text-xs font-bold px-2 py-1">
                  SAVE RS.{" "}
                  {Number(product.oldPrice - product.price).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-gray-600">
              Prices inclusive of all taxes
            </p>

            <p className="mt-2 text-sm text-gray-700">
              SKU: {product.id}-{selectedSize || "NA"}
            </p>

            <div className="mt-5 flex items-center gap-1 text-yellow-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
              <span className="ml-2 text-[#111]">3</span>
            </div>

            <div className="mt-8 border-t border-[#E5E5E5] pt-8">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Size:</p>
                <button className="text-sm underline text-[#8A5A5D]">
                  Size chart
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {sizes.map((size) => {
                  const stock = getSizeStock(size);
                  const disabled = stock <= 0;
                  const selected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      disabled={disabled}
                      onClick={() => {
                        setSelectedSize(size);
                        setQty(1);
                      }}
                      className={`relative w-16 h-11 border rounded-md overflow-hidden ${
                        disabled
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                          : selected
                          ? "bg-black text-white border-black ring-2 ring-[#8A5A5D]"
                          : "bg-white border-[#D9D9D9] hover:border-[#8A5A5D]"
                      }`}
                    >
                      {size}

                      {disabled && (
                        <span className="absolute left-1/2 top-1/2 h-[1px] w-[140%] bg-gray-400 -translate-x-1/2 -translate-y-1/2 -rotate-45" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedSize && (
                <p className="mt-3 text-xs text-gray-500">
                  {selectedStock} item(s) available in {selectedSize}
                </p>
              )}
            </div>

            <div className="mt-8">
              <p className="text-gray-600">Quantity:</p>

              <div className="mt-4 flex items-center gap-8 text-xl">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={!selectedSize}
                >
                  -
                </button>

                <span>{qty}</span>

                <button
                  onClick={() => {
                    if (qty >= selectedStock) {
                      toast.error(`Only ${selectedStock} available`);
                      return;
                    }
                    setQty((q) => q + 1);
                  }}
                  disabled={!selectedSize || qty >= selectedStock}
                  className="disabled:text-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || selectedStock <= 0}
                className="bg-[#8A5A5D] text-white py-4 font-bold hover:bg-[#70464A] disabled:bg-gray-300"
              >
                ADD TO CART
              </button>

              <button
  onClick={handleBuyNow}
  disabled={!selectedSize || selectedStock <= 0}
  className="border border-[#8A5A5D] text-[#8A5A5D] py-4 font-bold tracking-[0.25em] hover:bg-[#8A5A5D] hover:text-white disabled:opacity-50"
>
  BUY IT NOW
</button>
            </div>

<button
  onClick={handleWishlist}
  className="mt-5 inline-flex items-center gap-2 border border-[#8A5A5D] text-[#8A5A5D] px-5 py-3 hover:bg-[#8A5A5D] hover:text-white transition"
>
  <Heart size={20} />
  Add to wishlist
</button>

            <div className="mt-10 grid grid-cols-3 gap-6 text-center text-[#8A5A5D]">
              <div>
                <div className="text-4xl">☺</div>
                <p className="mt-2 text-sm">100k+ HAPPY CUSTOMERS</p>
              </div>

              <div>
                <div className="text-4xl">7</div>
                <p className="mt-2 text-sm">7 DAY NO QUESTION RETURN</p>
              </div>

              <div>
                <div className="text-4xl">9XL</div>
                <p className="mt-2 text-sm">MADE FOR PLUS SIZE ONLY</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold text-[#111]">
            More from {product.category}
          </h2>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {sameCategoryProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={handleCardAddToCart}
              />
            ))}
          </div>
        </section>

        <section className="mt-20 pb-20">
          <h2 className="text-2xl font-semibold text-[#111]">
            Bestseller Products
          </h2>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {bestsellerProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={handleCardAddToCart}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
