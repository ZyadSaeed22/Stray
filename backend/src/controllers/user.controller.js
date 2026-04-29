const User   = require('../models/User.model');
const Report = require('../models/Report.model');

const getProfile = async (req, res, next) => {
  try {
    const user    = await User.findById(req.user._id);
    const reports = await Report.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, user, reports });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id, { phone }, { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, total: users.length, users });
  } catch (err) { next(err); }
};

const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { isVerified: true }, { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User verified', user });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, getAllUsers, verifyUser };