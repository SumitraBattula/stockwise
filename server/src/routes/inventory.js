import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Movement from '../models/InventoryMovement.js';
import auth from '../middleware/auth.js';
const router = Router();
router.use(auth);

// Atomic quantity update prevents a stock-out from making inventory negative.
router.post('/movement', async (req, res, next) => {
  try {
    const { productId, kind, quantity, reason, batchExpiry } = req.body;
    const amount = Number(quantity);
    if (!mongoose.isValidObjectId(productId) || !['IN','OUT','ADJUSTMENT'].includes(kind) || !Number.isFinite(amount) || amount <= 0)
      return res.status(400).json({ message: 'Valid product, movement type, and positive quantity are required' });
    const filter = { _id: productId, shopId: req.userId };
    const product = await Product.findOne(filter);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    let before = product.quantity, after;
    if (kind === 'IN') after = before + amount;
    else if (kind === 'OUT') after = before - amount;
    else after = amount;
    if (after < 0) return res.status(409).json({ message: 'Insufficient stock for this stock-out' });
    const updateFilter = { ...filter, quantity: before };
    const updated = await Product.findOneAndUpdate(updateFilter, { $set: { quantity: after } }, { new: true });
    if (!updated) return res.status(409).json({ message: 'Inventory changed; refresh and retry' });
    const movement = await Movement.create({ shopId: req.userId, productId, kind, quantity: amount, before, after, reason: reason || '', batchExpiry: batchExpiry || null });
    res.status(201).json({ product: updated, movement });
  } catch (e) { next(e); }
});
router.get('/movements', async (req, res, next) => {
  try {
    const filter = { shopId: req.userId };
    if (req.query.productId) filter.productId = req.query.productId;
    res.json(await Movement.find(filter).populate('productId', 'name sku').sort({ createdAt: -1 }).limit(250));
  } catch (e) { next(e); }
});
export default router;