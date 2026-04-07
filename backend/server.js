const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read cart data
async function readCart() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    console.error('Error reading cart data:', error);
    throw error;
  }
}

// Helper function to write cart data
async function writeCart(cart) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(cart, null, 2));
  } catch (error) {
    console.error('Error writing cart data:', error);
    throw error;
  }
}

// GET /cart - Retrieve current cart
app.get('/cart', async (req, res) => {
  try {
    const cart = await readCart();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve cart' });
  }
});

// POST /cart - Update cart
app.post('/cart', async (req, res) => {
  try {
    const cart = req.body;
    
    // Validate cart structure
    if (!Array.isArray(cart)) {
      return res.status(400).json({ error: 'Cart must be an array' });
    }

    await writeCart(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// GET /products - Get product catalog
app.get('/products', (req, res) => {
const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 2999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 4999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
  },
  {
    id: 3,
    name: "Bluetooth Speaker",
    price: 1999,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad"
  },
  {
    id: 4,
    name: "Gaming Mouse",
    price: 1499,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7"
  },
  {
    id: 5,
    name: "Keyboard",
    price: 3499,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
  },
  {
    id: 6,
    name: "Charger",
    price: 999,
    image: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b"
  }
];
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Cart API: http://localhost:${PORT}/cart`);
  console.log(`Products API: http://localhost:${PORT}/products`);
});