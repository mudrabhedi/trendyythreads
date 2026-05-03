import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API } from "../api/api";
import {
  BarChart,
  PlusCircle,
  ShoppingBasket,
  Package,
  ClipboardList,
  Search,
  BadgePercent,
  Image as ImageIcon,
  Trash2,
  Star,
  Pencil,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart },
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "create", label: "Create Product", icon: PlusCircle },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "analytics", label: "Analytics", icon: Package },
];

const categories = [
  "All",
  "Jeans",
  "Pants",
  "Dresses",
  "Tops",
  "Coords",
  "Kurta",
  "Jackets",
];

const sizeOptions = ["L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL"];

const Badge = ({ children, variant = "default" }) => {
  const styles =
    variant === "success"
      ? "bg-green-50 text-green-700 border-green-200"
      : variant === "warning"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : variant === "danger"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-white text-[#111] border-[#D9D9D9]";

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs border ${styles}`}>
      {children}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, hint }) => (
  <div className="bg-white border border-[#E5E5E5] p-6">
    <div className="flex items-center justify-between">
      <div className="w-11 h-11 border border-[#E5E5E5] flex items-center justify-center">
        <Icon className="text-[#8A5A5D]" size={20} />
      </div>
      <Badge>Today</Badge>
    </div>

    <p className="mt-5 text-sm text-gray-500">{label}</p>
    <p className="mt-1 text-3xl font-semibold text-[#111]">{value}</p>
    {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
  </div>
);

const emptyForm = {
  name: "",
  category: "Jeans",
  price: "",
  imageUrl: "",
  featured: false,
  status: "Active",
};

const defaultSizeRows = [
  { size: "L", stock: 0 },
  { size: "XL", stock: 0 },
  { size: "2XL", stock: 0 },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
 const [orders, setOrders] = useState([]);

const loadOrders = async () => {
  try {
    const res = await API.get("/orders");
    setOrders(res.data);
  } catch (error) {
    toast.error("Failed to load orders");
  }
};



  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [editingProductId, setEditingProductId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState("");
  const [sizeRows, setSizeRows] = useState(defaultSizeRows);

  const loadProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : res.data.products || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    }
  };



  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = p.name || p.title || "";
      const category = p.category || "";

      const matchesQuery =
        name.toLowerCase().includes(query.toLowerCase()) ||
        category.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || category === categoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [products, query, categoryFilter]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total || order.totalAmount || 0), 0);
  }, [orders]);

  const resetProductForm = () => {
    setForm(emptyForm);
    setImagePreview("");
    setEditingProductId(null);
    setSizeRows(defaultSizeRows);
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onPickImage = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Image = reader.result;
      setImagePreview(base64Image);
      setForm((prev) => ({ ...prev, imageUrl: base64Image }));
    };

    reader.readAsDataURL(file);
  };

  const addSizeRow = () => {
    setSizeRows((prev) => [...prev, { size: "L", stock: 0 }]);
  };

  const updateSizeRow = (index, key, value) => {
    setSizeRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, [key]: key === "stock" ? Number(value) : value }
          : row
      )
    );
  };

  const removeSizeRow = (index) => {
    setSizeRows((prev) => prev.filter((_, i) => i !== index));
  };

  const startEditProduct = (product) => {
    setEditingProductId(product._id);

    setForm({
      name: product.name || product.title || "",
      category: product.category || "Jeans",
      price: product.price || "",
      imageUrl: product.image || "",
      featured: Boolean(product.featured),
      status: product.status === "Out of stock" ? "Active" : product.status || "Active",
    });

    setImagePreview(product.image || "");
    setSizeRows(product.sizes?.length ? product.sizes : defaultSizeRows);
    setActiveTab("create");
  };

  const saveProduct = async () => {
    if (!form.name.trim()) {
      toast.error("Please add product name");
      return;
    }

    if (!form.price) {
      toast.error("Please add product price");
      return;
    }

    const cleanSizes = sizeRows.map((row) => ({
      size: row.size,
      stock: Number(row.stock) || 0,
    }));

    const totalStock = cleanSizes.reduce((sum, row) => sum + row.stock, 0);

    const productData = {
      name: form.name.trim(),
      title: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      oldPrice: Number(form.price) + 1000,
      image:
        form.imageUrl ||
        imagePreview ||
        "https://images.unsplash.com/photo-1520975680700-6c11c1c2c6de?auto=format&fit=crop&w=1200&q=80",
      sizes: cleanSizes,
      stock: totalStock,
      featured: form.featured,
      status: totalStock <= 0 ? "Out of stock" : form.status,
    };

    try {
      if (editingProductId) {
        await API.put(`/products/${editingProductId}`, productData);
        toast.success("Product updated successfully");
      } else {
        await API.post("/products", productData);
        toast.success("Product created successfully");
      }

      await loadProducts();
      resetProductForm();
      setActiveTab("create");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      toast.success("Product deleted");
      await loadProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await API.put(`/products/${product._id}`, {
        ...product,
        featured: !product.featured,
      });

      toast.success(product.featured ? "Removed from featured" : "Marked as featured");
      await loadProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update featured");
    }
  };

  const statusBadge = (status) => {
    if (status === "Active") return <Badge variant="success">Active</Badge>;
    if (status === "Out of stock") return <Badge variant="warning">Out of stock</Badge>;
    if (status === "Hidden") return <Badge variant="danger">Hidden</Badge>;
    return <Badge>{status || "Active"}</Badge>;
  };

  const orderBadge = (status) => {
    if (status === "Delivered") return <Badge variant="success">Delivered</Badge>;
    if (status === "Processing") return <Badge variant="warning">Processing</Badge>;
    if (status === "Cancelled") return <Badge variant="danger">Cancelled</Badge>;
    return <Badge>{status || "Pending"}</Badge>;
  };

  return (
    <div className="min-h-screen bg-white pt-28 px-6">
      <div className="max-w-[1500px] mx-auto">
        <div className="border-b border-[#E5E5E5] pb-8">
          

          <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-semibold text-[#111]">Dashboard</h1>
              <p className="mt-2 text-gray-500">
                Manage products, track orders, and monitor store performance.
              </p>
            </div>

            <button
              onClick={() => {
                resetProductForm();
                setActiveTab("create");
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#8A5A5D] text-white px-6 py-3 hover:bg-[#70464A] transition"
            >
              <PlusCircle size={18} />
              Add Product
            </button>
          </div>
        </div>

        <div className="mt-8 border-b border-[#E5E5E5] flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-sm whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? "border-[#111] text-[#111]"
                  : "border-transparent text-gray-500 hover:text-[#111]"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-10">
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  icon={BadgePercent}
                  label="Revenue"
                  value={`₹${totalRevenue.toLocaleString("en-IN")}`}
                  hint="From saved orders"
                />
                <StatCard
                  icon={ClipboardList}
                  label="Orders"
                  value={orders.length}
                  hint="Total customer orders"
                />
                <StatCard
                  icon={ShoppingBasket}
                  label="Products"
                  value={products.length}
                  hint="Products from MongoDB"
                />
                <StatCard
                  icon={BarChart}
                  label="Low Stock"
                  value={products.filter((p) => Number(p.stock) <= 10).length}
                  hint="Products with 10 or less stock"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E5E5E5] p-6">
                  <h2 className="text-xl font-semibold text-[#111] mb-5">
                    Recent Orders
                  </h2>

                  <div className="divide-y divide-[#E5E5E5]">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o._id || o.id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#111]">
                            #{o._id || o.id}
                          </p>
                          <p className="text-sm text-gray-500">
  {o.customerName || "Customer"} • {o.items || 0} items
</p>

<p className="text-xs text-gray-400">
  {new Date(o.createdAt).toLocaleString()}
</p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-[#111]">
                            ₹{Number(o.total || o.totalAmount || 0).toLocaleString("en-IN")}
                          </p>
                          <div className="mt-2">{orderBadge(o.status)}</div>
                        </div>
                      </div>
                    ))}

                    {orders.length === 0 && (
                      <p className="text-sm text-gray-500 py-4">
                        No orders found yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5E5] p-6">
                  <h2 className="text-xl font-semibold text-[#111] mb-5">
                    Low Stock Alerts
                  </h2>

                  <div className="divide-y divide-[#E5E5E5]">
                    {products
                      .filter((p) => Number(p.stock) <= 10)
                      .map((p) => (
                        <div key={p._id} className="py-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-14 h-16 object-cover border border-[#E5E5E5]"
                            />
                            <div>
                              <p className="font-medium text-[#111]">{p.name}</p>
                              <p className="text-sm text-gray-500">{p.category}</p>
                            </div>
                          </div>

                          <Badge variant={Number(p.stock) === 0 ? "danger" : "warning"}>
                            {p.stock} left
                          </Badge>
                        </div>
                      ))}

                    {products.filter((p) => Number(p.stock) <= 10).length === 0 && (
                      <p className="text-sm text-gray-500 py-4">
                        No low-stock products right now.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="bg-white border border-[#E5E5E5]">
              <div className="p-6 border-b border-[#E5E5E5] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#111]">Products</h2>
                  <p className="text-sm text-gray-500">
                    Search, filter, edit, delete, and feature products.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full sm:w-72 pl-10 pr-3 py-3 border border-[#D9D9D9] text-[#111] focus:outline-none focus:border-[#111]"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-3 border border-[#D9D9D9] text-[#111] focus:outline-none focus:border-[#111]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      resetProductForm();
                      setActiveTab("create");
                    }}
                    className="bg-[#8A5A5D] text-white px-5 py-3 hover:bg-[#70464A]"
                  >
                    Add Product
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F7F7F7]">
                    <tr className="text-xs uppercase text-gray-500">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Featured</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E5E5E5]">
                    {filteredProducts.map((p) => (
                      <tr key={p._id}>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-14 h-16 object-cover border border-[#E5E5E5]"
                            />
                            <div>
                              <p className="font-medium text-[#111]">{p.name}</p>
                              <p className="text-xs text-gray-500">ID: {p._id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-[#111]">{p.category}</td>
                        <td className="py-4 px-6 font-medium text-[#111]">
                          ₹{Number(p.price).toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-6 text-[#111]">{p.stock}</td>
                        <td className="py-4 px-6">{statusBadge(p.status)}</td>

                        <td className="py-4 px-6">
                          <button
                            onClick={() => toggleFeatured(p)}
                            className={`inline-flex items-center gap-1 px-3 py-1 text-xs border ${
                              p.featured
                                ? "bg-[#111] text-white border-[#111]"
                                : "bg-white text-[#111] border-[#D9D9D9]"
                            }`}
                          >
                            <Star size={13} />
                            {p.featured ? "Featured" : "No"}
                          </button>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <button
                              onClick={() => startEditProduct(p)}
                              className="inline-flex items-center gap-2 text-[#8A5A5D] hover:text-[#70464A]"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>

                            <button
                              onClick={() => deleteProduct(p._id)}
                              className="inline-flex items-center gap-2 text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <div className="max-w-4xl mx-auto bg-white border border-[#E5E5E5]">
              <div className="p-6 border-b border-[#E5E5E5]">
                <h2 className="text-xl font-semibold text-[#111]">
                  {editingProductId ? "Edit Product" : "Create Product"}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingProductId
                    ? "Update this product in MongoDB."
                    : "Add a new product to your store."}
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-[#111]">
                    Product Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="e.g., Wide Leg Jeans"
                    className="mt-2 w-full px-3 py-3 border border-[#D9D9D9] focus:outline-none focus:border-[#111]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#111]">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                    className="mt-2 w-full px-3 py-3 border border-[#D9D9D9] focus:outline-none focus:border-[#111]"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#111]">Price ₹</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateForm("price", e.target.value)}
                    placeholder="e.g., 3299"
                    className="mt-2 w-full px-3 py-3 border border-[#D9D9D9] focus:outline-none focus:border-[#111]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-[#111]">
                    Product Image
                  </label>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="border border-[#E5E5E5] p-5">
                      <div className="flex items-center gap-2 text-[#111] mb-4">
                        <ImageIcon size={18} />
                        <span className="text-sm font-medium">Upload image</span>
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onPickImage(e.target.files?.[0])}
                        className="block w-full text-sm"
                      />

                      <input
                        value={form.imageUrl}
                        onChange={(e) => {
                          updateForm("imageUrl", e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="Or paste image URL"
                        className="mt-4 w-full px-3 py-3 border border-[#D9D9D9] focus:outline-none focus:border-[#111]"
                      />
                    </div>

                    <div className="border border-[#E5E5E5] p-5 flex items-center justify-center min-h-56">
                      {imagePreview || form.imageUrl ? (
                        <img
                          src={imagePreview || form.imageUrl}
                          alt="Preview"
                          className="w-full h-56 object-cover"
                        />
                      ) : (
                        <p className="text-sm text-gray-500">Image preview</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <label className="text-sm font-medium text-[#111]">
                        Sizes & Stock
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Add each size and its available quantity.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addSizeRow}
                      className="border border-[#111] px-4 py-2 text-sm hover:bg-[#111] hover:text-white transition"
                    >
                      + Add Size
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sizeRows.map((row, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 border border-[#E5E5E5] p-4"
                      >
                        <select
                          value={row.size}
                          onChange={(e) => updateSizeRow(index, "size", e.target.value)}
                          className="px-3 py-3 border border-[#D9D9D9] focus:outline-none focus:border-[#111]"
                        >
                          {sizeOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          value={row.stock}
                          onChange={(e) => updateSizeRow(index, "stock", e.target.value)}
                          className="px-3 py-3 border border-[#D9D9D9] focus:outline-none focus:border-[#111]"
                          placeholder="Stock"
                        />

                        <button
                          type="button"
                          onClick={() => removeSizeRow(index)}
                          className="px-4 py-3 text-red-600 border border-red-200 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#111]">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                    className="mt-2 w-full px-3 py-3 border border-[#D9D9D9] focus:outline-none focus:border-[#111]"
                  >
                    <option value="Active">Active</option>
                    <option value="Hidden">Hidden</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => updateForm("featured", !form.featured)}
                    className={`w-full px-4 py-3 border transition ${
                      form.featured
                        ? "bg-[#111] text-white border-[#111]"
                        : "bg-white text-[#111] border-[#D9D9D9]"
                    }`}
                  >
                    {form.featured ? "Featured: Yes" : "Featured: No"}
                  </button>
                </div>

                <button
                  onClick={saveProduct}
                  className="sm:col-span-2 w-full py-4 bg-[#8A5A5D] text-white font-semibold hover:bg-[#70464A] transition"
                >
                  {editingProductId ? "Update Product" : "Create Product"}
                </button>

                {editingProductId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="sm:col-span-2 w-full py-3 border border-[#D9D9D9] text-[#111] hover:border-[#111]"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white border border-[#E5E5E5]">
              <div className="p-6 border-b border-[#E5E5E5]">
                <h2 className="text-xl font-semibold text-[#111]">Orders</h2>
                <p className="text-sm text-gray-500">
                  Track customer orders from MongoDB.
                </p>
              </div>

              <div className="divide-y divide-[#E5E5E5]">
                {orders.map((o) => (
                  <div
                    key={o._id || o.id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold text-[#111]">#{o._id || o.id}</p>
                      <p className="text-sm text-gray-500">
                        {o.customerName || "Customer"}
                        {o.items || 0} items
                      </p>
                      <p className="text-xs text-gray-400">
  {new Date(o.createdAt).toLocaleString()}
</p>
                    </div>

                    <div className="flex items-center gap-5">
                      <p className="font-semibold text-[#111]">
                        ₹{Number(o.total || o.totalAmount || 0).toLocaleString("en-IN")}
                      </p>
                      {orderBadge(o.status)}
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <p className="p-6 text-sm text-gray-500">No orders found yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-[#E5E5E5] p-6">
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="mt-2 text-3xl font-semibold text-[#111]">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="bg-white border border-[#E5E5E5] p-6">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="mt-2 text-3xl font-semibold text-[#111]">
                    {orders.length}
                  </p>
                </div>

                <div className="bg-white border border-[#E5E5E5] p-6">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="mt-2 text-3xl font-semibold text-[#111]">
                    {products.length}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#E5E5E5] p-6">
                <h2 className="text-xl font-semibold text-[#111]">
                  Top selling category
                </h2>
                <p className="mt-2 text-gray-500">
                  Connect this with order item data for exact analytics.
                </p>

                <div className="mt-6 h-64 border border-dashed border-[#D9D9D9] flex items-center justify-center text-gray-400">
                  Analytics chart placeholder
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;