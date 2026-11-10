import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const router = Router();

function makeToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
router.post('/register', async (req, res, next) => {
  try {
    const { shopName, email, password } = req.body;
    if (!shopName?.trim() || !email?.trim() || !password || password.length < 8)
      return res.status(400).json({ message: 'Shop name, email, and password (8+ chars) are required' });
    const normalized = email.toLowerCase().trim();
    if (await User.findOne({ email: normalized }))
      return res.status(409).json({ message: 'An account with this email already exists' });
    const user = await User.create({ shopName: shopName.trim(), email: normalized, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: makeToken(user), user: { id: user._id, shopName: user.shopName, email: user.email } });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: makeToken(user), user: { id: user._id, shopName: user.shopName, email: user.email } });
  } catch (e) { next(e); }
});
export default router;