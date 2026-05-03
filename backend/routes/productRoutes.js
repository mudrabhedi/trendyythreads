import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Load products error:", error.message);
    res.status(500).json({ message: "Failed to load products" });
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: new RegExp(`^${req.params.category}$`, "i"),
      status: { $ne: "Hidden" },
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Load category products error:", error.message);
    res.status(500).json({ message: "Failed to load category products" });
  }
});

router.get("/featured/all", async (req, res) => {
  try {
    const products = await Product.find({
      featured: true,
      status: { $ne: "Hidden" },
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Load featured products error:", error.message);
    res.status(500).json({ message: "Failed to load featured products" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const products = await Product.find({ status: { $ne: "Hidden" } });

    const product = products.find(
      (p) =>
        slugify(p.title || p.name) === req.params.slug ||
        String(p._id) === String(req.params.slug)
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Load single product error:", error.message);
    res.status(500).json({ message: "Failed to load product" });
  }
});

router.post("/", async (req, res) => {
  try {
    const sizes = Array.isArray(req.body.sizes) ? req.body.sizes : [];

    const totalStock = sizes.reduce(
      (sum, row) => sum + Number(row.stock || 0),
      0
    );

    const product = await Product.create({
      name: req.body.name,
      title: req.body.title || req.body.name,
      category: req.body.category,
      price: Number(req.body.price || 0),
      oldPrice: Number(req.body.oldPrice || 0),
      image: req.body.image,
      sizes,
      stock: totalStock,
      featured: Boolean(req.body.featured),
      status: totalStock <= 0 ? "Out of stock" : req.body.status || "Active",
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error.message);
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const sizes = Array.isArray(req.body.sizes) ? req.body.sizes : [];

    const totalStock = sizes.reduce(
      (sum, row) => sum + Number(row.stock || 0),
      0
    );

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        title: req.body.title || req.body.name,
        category: req.body.category,
        price: Number(req.body.price || 0),
        oldPrice: Number(req.body.oldPrice || 0),
        image: req.body.image,
        sizes,
        stock: totalStock,
        featured: Boolean(req.body.featured),
        status: totalStock <= 0 ? "Out of stock" : req.body.status || "Active",
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error.message);
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;