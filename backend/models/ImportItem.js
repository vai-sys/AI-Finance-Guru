// models/ImportItem.js
const mongoose = require('mongoose');

const ImportItemSchema = new mongoose.Schema({
  import_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Import', required: true },
  raw: { type: mongoose.Schema.Types.Mixed },  
  extracted: {
    date: Date,
    amount: Number,
    currency: { type: String, default: 'INR' },
    description: String,
    vendor: String,
    account: String,
    category_suggestion: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
  },
  status: { type: String, enum: ['pending','rejected','committed'], default: 'pending' },
  confidence: { type: Number, default: null },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ImportItem', ImportItemSchema);
