import { Router } from 'express';
import Product from '../models/Product.js';
import Movement from '../models/InventoryMovement.js';
import auth from '../middleware/auth.js';
const router = Router();
router.use(auth);
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({ shopId: req.userId }).lean();
    const lowStock = products.filter(p => p.quantity <= p.reorderLevel);
    const movements = await Movement.find({ shopId: req.userId, createdAt: { $gte: new Date(Date.now() - 30*86400000) }, kind: 'OUT' }).lean();
    const soldByProduct = new Map();
    movements.forEach(m => soldByProduct.set(String(m.productId), (soldByProduct.get(String(m.productId)) || 0) + m.quantity));
    const reorderSuggestions = products.map(p => {
      const sold30 = soldByProduct.get(String(p._id)) || 0;
      const avgDaily = sold30 / 30;
      const point = Math.ceil(avgDaily * p.leadTimeDays + p.safetyStock);
      return { productId: p._id, name: p.name, quantity: p.quantity, avgDailyDemand: Number(avgDaily.toFixed(2)), leadTimeDays: p.leadTimeDays, safetyStock: p.safetyStock, reorderPoint: Math.max(p.reorderLevel, point), suggestedOrder: Math.max(0, p.targetStock - p.quantity) };
    }).filter(p => p.quantity <= p.reorderPoint).sort((a,b) => a.quantity-b.quantity);
    const expiry = await Movement.find({ shopId: req.userId, batchExpiry: { $gte: new Date(), $lte: new Date(Date.now()+30*86400000) }, kind: 'IN' }).populate('productId', 'name').sort({ batchExpiry: 1 }).limit(100);
    res.json({ productCount: products.length, stockUnits: products.reduce((s,p)=>s+p.quantity,0), lowStockCount: lowStock.length, lowStock, reorderSuggestions, nearExpiry: expiry });
  } catch (e) { next(e); }
});
export default router;