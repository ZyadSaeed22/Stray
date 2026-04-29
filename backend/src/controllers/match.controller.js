const Report      = require('../models/Report.model');
const faceService = require('../services/face.service');

const matchReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    if (!report.faceDescriptor?.length) {
      return res.status(400).json({
        success: false,
        message: 'Report has no face data. Please re-upload a clearer photo.',
      });
    }

    const oppositeType = report.type === 'missing' ? 'found' : 'missing';
    const candidates   = await Report.find({
      type: oppositeType,
      status: 'active',
      faceDescriptor: { $exists: true, $ne: [] },
    }).lean();

    const threshold = parseFloat(req.query.threshold) || faceService.THRESHOLD;
    const hits      = faceService.findMatches(report.faceDescriptor, candidates, threshold);

    if (hits.length > 0 && hits[0].distance <= faceService.AUTO_RESOLVE_THRESHOLD) {
      const best = hits[0];
      await Report.findByIdAndUpdate(report._id, {
        matchedWith: best.report._id, matchScore: best.similarity, status: 'resolved',
      });
      await Report.findByIdAndUpdate(best.report._id, {
        matchedWith: report._id, matchScore: best.similarity, status: 'resolved',
      });
    }

    res.json({
      success: true,
      total: hits.length,
      matches: hits.map((h) => ({
        reportId:    h.report._id,
        type:        h.report.type,
        childName:   h.report.childName,
        childPhoto:  h.report.childPhoto,
        governorate: h.report.governorate,
        phone:       h.report.phone,
        similarity:  h.similarity,
        autoResolved: h.distance <= faceService.AUTO_RESOLVE_THRESHOLD,
      })),
    });
  } catch (err) { next(err); }
};

const scanAll = async (req, res, next) => {
  try {
    const missingList = await Report.find({
      type: 'missing', status: 'active',
      faceDescriptor: { $exists: true, $ne: [] },
    }).lean();

    const foundList = await Report.find({
      type: 'found', status: 'active',
      faceDescriptor: { $exists: true, $ne: [] },
    }).lean();

    let resolved = 0;
    for (const m of missingList) {
      const hits = faceService.findMatches(m.faceDescriptor, foundList, faceService.AUTO_RESOLVE_THRESHOLD);
      if (!hits.length) continue;
      const best = hits[0];
      await Report.findByIdAndUpdate(m._id,           { matchedWith: best.report._id, matchScore: best.similarity, status: 'resolved' });
      await Report.findByIdAndUpdate(best.report._id, { matchedWith: m._id,           matchScore: best.similarity, status: 'resolved' });
      resolved++;
    }

    res.json({ success: true, message: `Scan complete – ${resolved} pair(s) resolved.`, resolved });
  } catch (err) { next(err); }
};

module.exports = { matchReport, scanAll };