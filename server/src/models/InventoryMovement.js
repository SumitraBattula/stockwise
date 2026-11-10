import mongoose from 'mongoose';
const movementSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  kind: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true },
  before: { type: Number, required: true },
  after: { type: Number, required: true },
  reason: { type: String, trim: true, maxlength: 200, default: '' },
  batchExpiry: { type: Date, default: null }
}, { timestamps: true });
export default mongoose.model('InventoryMovement', movementSchema);