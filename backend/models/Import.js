// models/Import.js
const mongoose = require('mongoose');

const ImportSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String },
  filepath: { type: String }, 
  status: { type: String, enum: ['pending','processing','done','failed'], default: 'pending' },
  result_summary: { type: mongoose.Schema.Types.Mixed, default: {} },
  error: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Import', ImportSchema);
