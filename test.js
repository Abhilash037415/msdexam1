const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "../products.json");

app.use(express.json());

function readProducts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "[]");
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
}

function writeProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error("Error writing file:", err);
  }
}

app.get("/", (req, res) => {
  res.send("🛍️ Product API is alive! Go to /products");
});

app.get("/products", (req, res) => {
  const products = readProducts();
  res.json(products);
});

app.get("/products/instock", (req, res) => {
  const products = readProducts().filter((p) => p.inStock === true);
  res.json(products);
});

app.post("/products", (req, res) => {
  const { name, price, inStock } = req.body;

  if (!name || price === undefined || typeof inStock !== "boolean") {
    return res.status(400).json({ error: "Invalid product data" });
  }

  const products = readProducts();
  const newId = products.length ? products[products.length - 1].id + 1 : 1;

  const newProduct = { id: newId, name, price, inStock };
  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const products = readProducts();
  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const updated = { ...products[index], ...req.body };
  products[index] = updated;
  writeProducts(products);

  res.json(updated);
});

app.delete("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const products = readProducts();
  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products.splice(index, 1);
  writeProducts(products);

  res.json({ message: `Product with id ${productId} deleted successfully` });
});

module.exports = app;
