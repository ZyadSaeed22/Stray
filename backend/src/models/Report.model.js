const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String, enum: ['missing', 'found'], required: true,
    },
    childName:   { type: String, trim: true, default: 'Unknown' },
    childAge:    { type: Number, min: 0, max: 18 },
    childGender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    childPhoto:  { type: String, required: true },
    description: { type: String, trim: true, maxlength: 500 },
    governorate: { type: String, trim: true },
    location:    { type: String, trim: true },
    phone:       { type: String, required: true },
    nationalId:  { type: String },
    faceDescriptor: { type: [Number], default: [] },
    matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
    matchScore:  { type: Number, default: null },
    status:      { type: String, enum: ['active', 'resolved', 'closed'], default: 'active' },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

reportSchema.index({ type: 1, status: 1, createdAt: -1 });
reportSchema.index({ governorate: 1 });

module.exports = mongoose.model('Report', reportSchema);