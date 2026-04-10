import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  brand: { type: String, default: '' },
  images: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  sold: { type: Number, default: 0 },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  featured: { type: Boolean, default: false },
  tags: [{ type: String }],
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
