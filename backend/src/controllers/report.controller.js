const Report      = require('../models/Report.model');
const faceService = require('../services/face.service');

const createReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Child photo is required' });
    }

    const {
      type, childName, childAge, childGender,
      phone, nationalId, governorate, location, description,
    } = req.body;

    let faceDescriptor = [];
    try {
      faceDescriptor = await faceService.extractDescriptor(req.file.path);
    } catch (faceErr) {
      console.warn('⚠️  Face extraction skipped:', faceErr.message);
    }

    const report = await Report.create({
      type, childName, childAge, childGender,
      childPhoto: req.file.path,
      faceDescriptor,
      phone, nationalId, governorate, location, description,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Report submitted', report });
  } catch (err) { next(err); }
};

const getReports = async (req, res, next) => {
  try {
    const { type, status = 'active', governorate, page = 1, limit = 12 } = req.query;
    const filter = { status };
    if (type)        filter.type        = type;
    if (governorate) filter.governorate = governorate;

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('createdBy', 'email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Report.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      reports,
    });
  } catch (err) { next(err); }
};

const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('createdBy', 'email phone')
      .populate('matchedWith');

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (err) { next(err); }
};

const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const isOwner = report.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await report.deleteOne();
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) { next(err); }
};

module.exports = { createReport, getReports, getReport, deleteReport };