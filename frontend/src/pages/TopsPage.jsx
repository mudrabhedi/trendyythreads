import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

const allSizes = ["L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL"];

export default function TopsPage() {
  const [sort, setSort] = useState("featured");
  const [adminProducts, setAdminProducts] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 0]);

  const loadAdminProducts = () => {
    const savedProducts = JSON.parse(localStorage.getItem("adminProducts")) || [];

    const topsOnly = savedProducts.filter(
      (product) =>
        product.category?.toLowerCase() === "tops" &&
        product.status !== "Hidden"
    );

    setAdminProducts(topsOnly);
  };

  useEffect(() => {
    loadAdminProducts();

    window.addEventListener("productsUpdated", loadAdminProducts);
    window.addEventListener("storage", loadAdminProducts);

    return () => {
      window.removeEventListener("productsUpdated", loadAdminProducts);
      window.removeEventListener("storage", loadAdminProducts);
    };
  }, []);

  const topsProducts = useMemo(() => {
    return adminProducts.map((product) => ({
      ...product,
      title: product.title || product.name,
      price: Number(product.price || 0),
      sizes: product.sizes || [],
    }));
  }, [adminProducts]);

  const maxProductPrice = useMemo(() => {
    if (topsProducts.length === 0) return 0;
    return Math.max(...topsProducts.map((p) => Number(p.price || 0)));
  }, [topsProducts]);

  useEffect(() => {
    setPriceRange([0, maxProductPrice]);
  }, [maxProductPrice]);

  const dynamicSizes = useMemo(() => {
    return allSizes
      .map((size) => {
        const count = topsProducts.filter((product) =>
          product.sizes?.some((s) => s.size === size && Number(s.stock) > 0)
        ).length;

        return { size, count };
      })
      .filter((item) => item.count > 0);
  }, [topsProducts]);

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setPriceRange([0, maxProductPrice]);
  };

  const filteredProducts = useMemo(() => {
    return topsProducts.filter((product) => {
      const price = Number(product.price || 0);

      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      const matchesSize =
        selectedSizes.length === 0 ||
        selectedSizes.some((size) =>
          product.sizes?.some((s) => s.size === size && Number(s.stock) > 0)
        );

      return matchesPrice && matchesSize;
    });
  }, [topsProducts, priceRange, selectedSizes]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sort === "low-high") return a.price - b.price;
      if (sort === "high-low") return b.price - a.price;
      return String(b.id).localeCompare(String(a.id));
    });
  }, [filteredProducts, sort]);

 const handleAddToCart = async (product) => {
  const productId = product._id || product.id;

  const selectedStock =
    product.sizes?.find((s) => s.size === product.size)?.stock || 0;

  if (selectedStock <= 0) {
    toast.error("Selected size is out of stock");
    return;
  }

  if (product.quantity > selectedStock) {
    toast.error(`Only ${selectedStock} item(s) available`);
    return;
  }

  const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItemIndex = existingCart.findIndex(
    (item) =>
      String(item._id || item.id) === String(productId) &&
      item.size === product.size
  );

  if (existingItemIndex !== -1) {
    existingCart[existingItemIndex].quantity += product.quantity;
  } else {
    existingCart.push({
      ...product,
      id: productId,
      _id: productId,
    });
  }

  localStorage.setItem("cart", JSON.stringify(existingCart));

  const updatedSizes = product.sizes.map((s) => {
    if (s.size !== product.size) return s;

    return {
      ...s,
      stock: Math.max(0, Number(s.stock) - Number(product.quantity)),
    };
  });

  const totalStock = updatedSizes.reduce(
    (sum, s) => sum + Number(s.stock || 0),
    0
  );

  const updatedProduct = {
    ...product,
    sizes: updatedSizes,
    stock: totalStock,
    status: totalStock <= 0 ? "Out of stock" : "Active",
  };

  try {
    await API.put(`/products/${productId}`, updatedProduct);

    setAdminProducts((prev) =>
      prev.map((p) =>
        String(p._id || p.id) === String(productId) ? updatedProduct : p
      )
    );

    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("productsUpdated"));

    toast.success("Added to cart");
  } catch (error) {
    console.error(error);
    toast.error("Failed to update product stock");
  }
};
  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="max-w-[1500px] mx-auto px-8">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#111]">Tops</h1>
            <p className="mt-2 text-sm text-gray-500">
              {filteredProducts.length} products
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Sort by</span>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-[#D9D9D9] px-4 py-2 text-sm focus:outline-none focus:border-[#111]"
            >
              <option value="featured">Featured</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 mt-8">
          <aside className="hidden lg:block">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-[#111]">Filters</h2>

              {(selectedSizes.length > 0 ||
                priceRange[0] !== 0 ||
                priceRange[1] !== maxProductPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-sm underline text-[#8A5A5D]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="border-b border-[#E5E5E5] pb-8">
              <div className="flex items-center justify-between text-[#111]">
                <h3 className="text-lg font-medium">Price</h3>
                <span>⌃</span>
              </div>

              <div className="mt-6">
                <input
                  type="range"
                  min="0"
                  max={maxProductPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-[#8A5A5D]"
                />

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 border border-[#D9D9D9] px-3 py-3 text-sm text-gray-500">
                    ₹ {priceRange[0]}
                  </div>

                  <span className="text-gray-500">to</span>

                  <div className="flex-1 border border-[#D9D9D9] px-3 py-3 text-sm text-gray-500">
                    ₹ {priceRange[1]}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-[#E5E5E5] py-8">
              <div className="flex items-center justify-between text-[#111]">
                <h3 className="text-lg font-medium">Size</h3>
                <span>⌃</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {dynamicSizes.map(({ size, count }) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 border rounded-md text-sm transition ${
                      selectedSizes.includes(size)
                        ? "bg-black text-white border-black"
                        : "bg-white text-[#111] border-[#D9D9D9] hover:border-[#8A5A5D]"
                    }`}
                  >
                    {size} ({count})
                  </button>
                ))}

                {dynamicSizes.length === 0 && (
                  <p className="text-sm text-gray-500">No sizes available</p>
                )}
              </div>
            </div>
          </aside>

          <section>
            {sortedProducts.length === 0 ? (
              <div className="min-h-[300px] flex items-center justify-center border border-dashed border-[#D9D9D9] text-gray-500">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
