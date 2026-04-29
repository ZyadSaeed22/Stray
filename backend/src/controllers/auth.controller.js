const User              = require('../models/User.model');
const { generateToken } = require('../config/jwt');

const signup = async (req, res, next) => {
  try {
    const { email, password, phone, nationalId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'National card photo is required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      email, password, phone, nationalId,
      nationalCardPhoto: req.file.path,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: sanitize(user),
    });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ success: true, message: 'Login successful', token, user: sanitize(user) });
  } catch (err) { next(err); }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
};

const sanitize = (u) => ({
  id: u._id, email: u.email, phone: u.phone,
  role: u.role, isVerified: u.isVerified, createdAt: u.createdAt,
});

module.exports = { signup, login, getMe };