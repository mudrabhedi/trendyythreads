import {
  ShoppingBag,
  Search,
  User,
  UserPlus,
  LogOut,
  Lock,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { API } from "../api/api";
import { useNavigate } from "react-router-dom";

const Logo = () => (
  <div className="flex items-center gap-3">
    <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="26" stroke="#9F5C69" strokeWidth="2" />
      <line x1="30" y1="12" x2="30" y2="38" stroke="#9F5C69" strokeWidth="2" />
      <line x1="22" y1="18" x2="38" y2="18" stroke="#9F5C69" strokeWidth="2" />
      <path
        d="M30 38 C30 48, 48 48, 52 40"
        stroke="#9F5C69"
        strokeWidth="2"
        fill="none"
      />
    </svg>

    <span className="text-2xl font-semibold tracking-wide text-[#2B2B2B]">
      TrendyThreads
    </span>
  </div>
);

const Navbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  const isAdmin = user?.role === "admin";

  // ✅ Load products from localStorage
  useEffect(() => {
    const products =
      JSON.parse(localStorage.getItem("adminProducts")) ||
      JSON.parse(localStorage.getItem("products")) ||
      [];

    setAllProducts(products);
  }, []);

  // ✅ Filter products
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase();

    return allProducts.filter((product) => {
      return (
        product.name?.toLowerCase().includes(q) ||
        product.title?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, allProducts]);

  // ✅ Cart count
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const totalItems = cart.reduce(
      (total, item) => total + (item.quantity || 1),
      0
    );

    setCartCount(totalItems);
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // ✅ Get user
  useEffect(() => {
    const getProfile = async () => {
      try {
const res = await API.get("/auth/profile", {
  withCredentials: true,
});
setUser(res.data);
localStorage.setItem("user", JSON.stringify(res.data));
      } catch {
        localStorage.removeItem("user");
localStorage.removeItem("token");
localStorage.removeItem("loggedInUser");
      }
    };

    getProfile();
  }, []);

  // ✅ Logout
  const logout = async () => {
    try {
await API.post(
  "/auth/logout",
  {},
  { withCredentials: true }
);
setUser(null);
localStorage.removeItem("user");
localStorage.removeItem("token");
localStorage.removeItem("loggedInUser");
    } catch {
      console.error("Logout failed");
    }
  };

  const navLinks = [
    { label: "Jeans", href: "/jeans" },
    { label: "Pants", href: "/pants" },
    { label: "Dresses", href: "/dresses" },
    { label: "Featured", href: "/featured" },
    { label: "Tops", href: "/tops" },
    { label: "Coords", href: "/coords" },
    { label: "Kurta", href: "/kurta" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50 border-b border-[#E5E5E5]">
      <div className="w-full px-10 py-6 flex items-center justify-between relative">
        <a href="/">
          <Logo />
        </a>

        {/* NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-8 text-[18px] text-[#333]">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hover:text-[#9F5C69] transition whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6 text-[#222] relative">
          {/* 🔍 SEARCH ICON */}
          <button
            onClick={() => setShowSearch((prev) => !prev)}
            className="hover:text-[#9F5C69] transition"
          >
            <Search size={28} strokeWidth={1.6} />
          </button>

          {/* 🔍 SEARCH BOX */}
          {showSearch && (
            <div className="absolute top-16 right-0 w-[320px] bg-white shadow-xl rounded-2xl p-4 border border-[#eee]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 border rounded-full outline-none focus:border-[#9F5C69]"
                />
                <button onClick={() => setShowSearch(false)}>
                  <X size={22} />
                </button>
              </div>

              {/* RESULTS */}
              <div className="mt-4 max-h-64 overflow-y-auto">
                {searchQuery && filteredProducts.length === 0 && (
                  <p className="text-sm text-gray-500">No results found</p>
                )}

                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt=""
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUTH */}
          {!user && (
            <a href="/signup" className="hover:text-[#9F5C69] transition">
              <UserPlus size={27} strokeWidth={1.5} />
            </a>
          )}

          {user && (
            <>
              <a href="/account" className="hover:text-[#9F5C69] transition">
  <User size={27} strokeWidth={1.5} />
</a>

              {isAdmin && (
                <a href="/secret-dashboard">
                  <Lock size={26} />
                </a>
              )}

              <button onClick={logout}>
                <LogOut size={27} />
              </button>
            </>
          )}

          {/* CART */}
          <a href="/cart" className="relative hover:text-[#9F5C69] transition">
            <ShoppingBag size={28} strokeWidth={1.5} />

            {cartCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-[#1F2430] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                {cartCount}
              </span>
            )}
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;