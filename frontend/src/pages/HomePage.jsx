import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import useWishlist from "../hooks/useWishlist";
import toast from "react-hot-toast";

const STORAGE_KEYS = ["products", "inventory", "adminProducts"];

const HeroBanner = () => (
  <section className="bg-white border-b border-[#E5E5E5]">
    <div className="w-full">
      <img
        src="https://www.amydus.com/cdn/shop/files/desk1.png?v=294626692311148480"
        alt="Jeans banner"
        className="w-full h-[420px] sm:h-[520px] lg:h-[620px] object-cover"
      />
    </div>
  </section>
);

const CategoryCircle = ({ title, href, image }) => (
  <a href={href} className="group text-center shrink-0">
    <div className="w-[130px] h-[130px] md:w-[145px] md:h-[145px] rounded-full overflow-hidden mx-auto bg-[#EEF1F3] border border-[#E5E5E5]">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
      />
    </div>

    <p className="mt-5 text-[18px] font-normal text-[#111] group-hover:text-[#8A5A5D] transition">
      {title}
    </p>
  </a>
);

const CategoryCircles = () => {
  const categories = [
    {
      title: "Jeans",
      href: "/jeans",
      image:
        "https://cdn.shopify.com/s/files/1/0273/5800/3275/t/45/assets/fd50f6860293--17-b35395.jpg?v=1769164168",
    },
    {
      title: "Dresses",
      href: "/dresses",
      image:
        "https://cdn.shopify.com/s/files/1/0273/5800/3275/t/45/assets/fd50f6860293--15-49781a.jpg?v=1769164224",
    },
    {
      title: "Tops",
      href: "/tops",
      image:
        "https://cdn.shopify.com/s/files/1/0273/5800/3275/t/45/assets/fd50f6860293--11-1a82a3.jpg?v=1769164253",
    },
    {
      title: "Denim",
      href: "/denim",
      image:
        "https://cdn.shopify.com/s/files/1/0273/5800/3275/t/45/assets/fd50f6860293--ebc0ce6fa010-10-f47104-1-8b04a6.jpg?v=1770970018",
    },
    {
      title: "Best Pants",
      href: "/pants",
      image:
        "https://cdn.shopify.com/s/files/1/0273/5800/3275/t/45/assets/fd50f6860293--16-8f364b.jpg?v=1769164208",
    },
    {
      title: "Coords",
      href: "/coords",
      image:
        "https://cdn.shopify.com/s/files/1/0273/5800/3275/t/45/assets/fd50f6860293--14-932197.jpg?v=1769164239",
    },
    {
      title: "Kurta",
      href: "/kurta",
      image:
        "https://cdn.shopify.com/s/files/1/0273/5800/3275/t/45/assets/fd50f6860293--18-aabcc2.jpg?v=1769164269",
    },
  ];

  return (
    <section className="bg-white py-12 border-b border-[#E5E5E5]">
      <div className="w-full px-8">
        <div className="flex items-start justify-between gap-8 overflow-x-auto pb-3">
          {categories.map((cat) => (
            <CategoryCircle key={cat.title} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
};

const SectionTitle = ({ title, viewAll }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl md:text-2xl font-medium text-[#111]">{title}</h2>

    {viewAll && (
      <a
        href={viewAll}
        className="text-sm tracking-wide uppercase text-[#8A5A5D] hover:underline"
      >
        View all
      </a>
    )}
  </div>
);

export default function HomePage() {
  const { isWished, toggle } = useWishlist();
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const loadInventory = () => {
      let savedProducts = [];

      for (const key of STORAGE_KEYS) {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(data) && data.length > 0) {
          savedProducts = data;
          break;
        }
      }

      const cleaned = savedProducts.map((p) => ({
        ...p,
        id: p.id || p._id || crypto.randomUUID(),
        title: p.title || p.name || "Untitled Product",
        price: Number(p.price || p.salePrice || 0),
        oldPrice: Number(p.oldPrice || p.mrp || p.originalPrice || 0),
        image:
          p.image ||
          p.imageUrl ||
          p.thumbnail ||
          p.images?.[0] ||
          "https://via.placeholder.com/600x800?text=Product",
        href: p.href || `/product/${p.id || p._id}`,
        category: p.category || "",
        createdAt:
          p.createdAt ||
          p.dateAdded ||
          p.addedAt ||
          p.updatedAt ||
          new Date().toISOString(),
      }));

      setInventory(cleaned);
    };

    loadInventory();

    window.addEventListener("storage", loadInventory);
    window.addEventListener("productsUpdated", loadInventory);

    return () => {
      window.removeEventListener("storage", loadInventory);
      window.removeEventListener("productsUpdated", loadInventory);
    };
  }, []);

  const newArrivals = useMemo(() => {
    return [...inventory]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [inventory]);

  const jeansProducts = useMemo(() => {
    return inventory.filter((p) =>
      String(p.category).toLowerCase().includes("jeans")
    );
  }, [inventory]);

  const bestsellerProducts = useMemo(() => {
    return [...inventory]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
  }, [inventory]);

  const handleAddToCart = (product) => {
    const cartProduct = {
      ...product,
      quantity: product.quantity || 1,
      size: product.size || "Default",
    };

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItemIndex = existingCart.findIndex(
      (item) => item.id === cartProduct.id && item.size === cartProduct.size
    );

    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity += cartProduct.quantity;
    } else {
      existingCart.push(cartProduct);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Added to cart 🛍️");
  };

  const ProductGrid = ({ products }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          isWished={isWished}
          onToggleWish={toggle}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );

  const HorizontalSlider = ({ products }) => (
    <div className="flex gap-5 overflow-x-auto pb-4 scroll-smooth">
      {products.map((p) => (
        <div
          key={p.id}
          className="min-w-[220px] sm:min-w-[260px] md:min-w-[300px]"
        >
          <ProductCard
            product={p}
            isWished={isWished}
            onToggleWish={toggle}
            onAddToCart={handleAddToCart}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white text-[#111]">
      <HeroBanner />
      <CategoryCircles />

      <section className="max-w-7xl mx-auto px-6 py-12">
        <SectionTitle title="New Arrivals" />
        {newArrivals.length > 0 ? (
          <ProductGrid products={newArrivals} />
        ) : (
          <p className="text-gray-500">No new arrivals yet.</p>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-[#E5E5E5]">
        <SectionTitle title="Jeans Collection" viewAll="/jeans" />
        {jeansProducts.length > 0 ? (
          <HorizontalSlider products={jeansProducts} />
        ) : (
          <p className="text-gray-500">No jeans products found.</p>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-[#E5E5E5]">
        <SectionTitle title="Bestsellers" />
        {bestsellerProducts.length > 0 ? (
          <ProductGrid products={bestsellerProducts} />
        ) : (
          <p className="text-gray-500">No bestseller products yet.</p>
        )}
      </section>
    </div>
  );
}
