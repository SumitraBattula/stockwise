import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  sku: { type: String, trim: true, maxlength: 50, default: '' },
  category: { type: String, trim: true, maxlength: 80, default: 'General' },
  unit: { type: String, trim: true, default: 'pcs' },
  quantity: { type: Number, min: 0, default: 0 },
  reorderLevel: { type: Number, min: 0, default: 5 },
  safetyStock: { type: Number, min: 0, default: 5 },
  leadTimeDays: { type: Number, min: 0, default: 3 },
  targetStock: { type: Number, min: 0, default: 30 },
  costPrice: { type: Number, min: 0, default: 0 },
  sellingPrice: { type: Number, min: 0, default: 0 }
}, { timestamps: true });
productSchema.index({ shopId: 1, name: 1 });
export default mongoose.model('Product', productSchema);