const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// ✅ IMPORTANT: use Render port
const PORT = process.env.PORT || 3000;

// File path
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// ------------------ CART FUNCTIONS ------------------

// Read cart
async function readCart() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error(error);
    return [];
  }
}

// Write cart
async function writeCart(cart) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(cart, null, 2));
  } catch (error) {
    console.error(error);
  }
}

// ------------------ ROUTES ------------------

// GET CART
app.get('/cart', async (req, res) => {
  const cart = await readCart();
  res.json(cart);
});

// POST CART
app.post('/cart', async (req, res) => {
  const cart = req.body;

  if (!Array.isArray(cart)) {
    return res.status(400).json({ error: 'Cart must be array' });
  }

  await writeCart(cart);
  res.json({ success: true });
});

// GET PRODUCTS
app.get('/products', (req, res) => {
  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 2999,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 4999,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
    },
    {
      id: 3,
      name: "Bluetooth Speaker",
      price: 1999,
      image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400"
    },
    {
      id: 4,
      name: "Gaming Mouse",
      price: 1499,
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"
    },
    {
      id: 5,
      name: "Keyboard",
      price: 3499,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"
    },
    {
      id: 6,
      name: "Charger",
      price: 999,
      image: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400"
    }
  ];

  res.json(products);
});

// ------------------ START SERVER ------------------

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});