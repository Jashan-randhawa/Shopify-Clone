import express from 'express';
import Product from '../models/Product.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products - list with filtering, sorting, pagination (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort = '-createdAt', page = 1, limit = 12, featured } = req.query;
    const query = {};

    if (search) {
      const regex = new RegExp(search.trim().split(/\s+/).join('|'), 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
        { brand: regex },
        { tags: regex },
      ];
    }
    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.featured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    return res.status(200).json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/products/categories (PUBLIC) — must be before /:id
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/products/seed/run - admin seed (static, must be before /:id)
router.post('/seed/run', isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Product.deleteMany({});
    const products = getSampleProducts();
    await Product.insertMany(products);
    return res.status(201).json({ success: true, message: `${products.length} products seeded` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/products - create product (admin)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// GET /api/products/:id (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/products/:id - admin update
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/products/:id - admin delete
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', isAuthenticated, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    }

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.numReviews = product.reviews.length;
    product.ratings = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    await product.save();
    return res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

const getSampleProducts = () => [
  { name: 'Wireless Noise-Cancelling Headphones', description: 'Premium audio experience with active noise cancellation, 30-hour battery life, and ultra-comfortable over-ear design.', price: 299.99, originalPrice: 399.99, category: 'Electronics', brand: 'SoundMaster', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'], stock: 45, ratings: 4.7, numReviews: 128, featured: true, tags: ['headphones', 'wireless', 'audio'] },
  { name: 'Smart Watch Series X', description: 'Advanced health tracking, GPS, ECG monitoring, and 7-day battery. Compatible with iOS and Android.', price: 399.00, originalPrice: 499.00, category: 'Electronics', brand: 'TechWear', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'], stock: 30, ratings: 4.5, numReviews: 89, featured: true, tags: ['smartwatch', 'wearable', 'fitness'] },
  { name: 'Minimalist Leather Wallet', description: 'Slim bifold wallet in genuine full-grain leather. Holds up to 8 cards with RFID blocking technology.', price: 49.99, originalPrice: 79.99, category: 'Accessories', brand: 'SlimCraft', images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'], stock: 120, ratings: 4.8, numReviews: 245, featured: false, tags: ['wallet', 'leather', 'minimalist'] },
  { name: 'Running Shoes Pro', description: 'Lightweight and breathable running shoes with advanced cushioning technology for maximum comfort on any terrain.', price: 129.99, originalPrice: 179.99, category: 'Footwear', brand: 'StridePro', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], stock: 75, ratings: 4.6, numReviews: 192, featured: true, tags: ['running', 'shoes', 'sports'] },
  { name: 'Portable Bluetooth Speaker', description: 'Waterproof, 360-degree sound speaker with 24-hour battery. Perfect for outdoors and travel.', price: 89.99, originalPrice: 119.99, category: 'Electronics', brand: 'BassBox', images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'], stock: 60, ratings: 4.4, numReviews: 156, featured: false, tags: ['speaker', 'bluetooth', 'outdoor'] },
  { name: 'Stainless Steel Water Bottle', description: 'Double-wall vacuum insulated bottle. Keeps drinks cold 24h, hot 12h. BPA-free, 32oz capacity.', price: 34.99, originalPrice: 44.99, category: 'Home & Kitchen', brand: 'HydroElite', images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'], stock: 200, ratings: 4.9, numReviews: 412, featured: false, tags: ['bottle', 'hydration', 'eco'] },
  { name: 'Mechanical Gaming Keyboard', description: 'RGB backlit mechanical keyboard with tactile switches, anti-ghosting, and programmable macros for competitive gaming.', price: 149.99, originalPrice: 199.99, category: 'Electronics', brand: 'KeyForge', images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'], stock: 40, ratings: 4.6, numReviews: 87, featured: true, tags: ['keyboard', 'gaming', 'mechanical'] },
  { name: 'Linen Casual Shirt', description: 'Breathable 100% linen summer shirt. Perfect for casual occasions. Available in multiple colors.', price: 54.99, originalPrice: 74.99, category: 'Clothing', brand: 'LinenCo', images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'], stock: 90, ratings: 4.3, numReviews: 63, featured: false, tags: ['shirt', 'linen', 'casual'] },
  { name: 'Yoga Mat Premium', description: 'Non-slip, eco-friendly TPE yoga mat with alignment lines. 6mm thick for joint support. Includes carry strap.', price: 69.99, originalPrice: 89.99, category: 'Sports', brand: 'ZenFlow', images: ['https://images.unsplash.com/photo-1601925228843-1ed7a87e1ec8?w=500'], stock: 85, ratings: 4.7, numReviews: 203, featured: false, tags: ['yoga', 'fitness', 'mat'] },
  { name: 'Espresso Coffee Machine', description: 'Barista-quality espresso at home. 15-bar pressure, milk frother, and programmable settings. Easy clean.', price: 249.99, originalPrice: 349.99, category: 'Home & Kitchen', brand: 'BrewMaster', images: ['https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=500'], stock: 25, ratings: 4.5, numReviews: 98, featured: true, tags: ['coffee', 'espresso', 'kitchen'] },
  { name: 'Sunglasses Polarized', description: 'UV400 polarized lenses with lightweight titanium frame. Reduces glare for driving and outdoor activities.', price: 89.99, originalPrice: 129.99, category: 'Accessories', brand: 'ClearVision', images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'], stock: 65, ratings: 4.4, numReviews: 74, featured: false, tags: ['sunglasses', 'polarized', 'fashion'] },
  { name: 'Backpack Travel 40L', description: 'Durable waterproof 40L travel backpack with USB charging port, laptop compartment, and ergonomic design.', price: 79.99, originalPrice: 109.99, category: 'Accessories', brand: 'TrailBlaze', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], stock: 55, ratings: 4.6, numReviews: 135, featured: false, tags: ['backpack', 'travel', 'laptop'] },
];

export default router;
