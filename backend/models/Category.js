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


  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },


  source: {
    type: String,
    enum: ['global', 'user'],
    default: 'global'
  },

 
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }

}, { timestamps: true });




module.exports = mongoose.model('Category', CategorySchema);
