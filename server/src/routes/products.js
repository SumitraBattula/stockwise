import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Movement from '../models/InventoryMovement.js';
import auth from '../middleware/auth.js';
const router = Router();
router.use(auth);
const fields = ['name','sku','category','unit','reorderLevel','safetyStock','leadTimeDays','targetStock','costPrice','sellingPrice'];

router.get('/', async (req, res, next) => {
  try {
    const filter = { shopId: req.userId };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.name = { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    res.json(await Product.find(filter).sort({ name: 1 }));
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.name?.trim()) return res.status(400).json({ message: 'Product name is required' });
    const product = await Product.create({ ...Object.fromEntries(fields.map(k => [k, req.body[k]])), quantity: Math.max(0, Number(req.body.quantity) || 0), shopId: req.userId });
    if (product.quantity) await Movement.create({ shopId: req.userId, productId: product._id, kind: 'IN', quantity: product.quantity, before: 0, after: product.quantity, reason: 'Opening stock' });
    res.status(201).json(product);
  } catch (e) { next(e); }
});
router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
    const updates = Object.fromEntries(fields.filter(k => req.body[k] !== undefined).map(k => [k, req.body[k]]));
    const product = await Product.findOneAndUpdate({ _id: req.params.id, shopId: req.userId }, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, shopId: req.userId });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (e) { next(e); }
});
export default router;