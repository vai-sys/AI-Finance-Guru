const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']   
  },

  // null → top-level category
  // otherwise → child category inside another category
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },

  // "global" → created by system (Food, Travel, Salary...)
  // "user"   → created by the user
  source: {
    type: String,
    enum: ['global', 'user'],
    default: 'global'
  },

  // Only needed if source === 'user'
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }

}, { timestamps: true });




module.exports = mongoose.model('Category', CategorySchema);
