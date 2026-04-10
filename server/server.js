import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import chatRoutes from './routes/chat.js';
import userRoutes from './routes/user.js';
import messageRoutes from './routes/message.js';
import Product from './models/Product.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Server running' }));

// ─── Seed products from DummyJSON on first run ────────────────────────────────
async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Products already seeded (${count} found), skipping.`);
      return;
    }

    console.log('Seeding products from DummyJSON...');
    const res = await fetch('https://dummyjson.com/products?limit=100');
    if (!res.ok) throw new Error(`DummyJSON responded with ${res.status}`);
    const data = await res.json();

    const products = data.products.map((p) => ({
      name: p.title,
      description: p.description,
      price: p.price,
      originalPrice: p.discountPercentage
        ? parseFloat((p.price / (1 - p.discountPercentage / 100)).toFixed(2))
        : undefined,
      category: p.category,
      brand: p.brand || '',
      images: p.images?.length ? p.images : [p.thumbnail],
      stock: p.stock ?? 10,
      ratings: p.rating ?? 0,
      numReviews: p.reviews?.length ?? 0,
      featured: (p.rating ?? 0) >= 4.5,
      tags: p.tags || [],
      sold: 0,
    }));

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products from DummyJSON.`);
  } catch (err) {
    console.error('❌ Product seeding failed:', err.message);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedProducts();
  })
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
