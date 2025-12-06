const mongoose = require('mongoose');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');


const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);


const createCategory=async(req, res)=> {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized' });
    const userId = req.user._id;

    const { name, type = 'expense', parent_id = null } = req.body;
    if (!name || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'name and valid type required' });
    }

    let parentIdToSet = null;
    if (parent_id) {
      if (!isValidId(parent_id)) return res.status(400).json({ message: 'invalid parent_id' });
      const parent = await Category.findById(parent_id).lean();
      if (!parent) return res.status(400).json({ message: 'parent category not found' });
  
      const allowed = parent.source === 'global' || (parent.source === 'user' && String(parent.user_id) === String(userId));
      if (!allowed) return res.status(403).json({ message: 'cannot use selected parent' });
      parentIdToSet = parent._id;
    }

    const cat = new Category({
      name: String(name).trim(),
      type,
      parent_id: parentIdToSet,
      source: 'user',
      user_id: userId
    });

    await cat.save();
    return res.status(201).json({ message: 'category created', category: cat });
  } catch (err) {
    console.error('createCategory error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}


const updateCategory=async(req, res) =>{
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized' });
    const userId = String(req.user._id);
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ message: 'invalid id' });

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'category not found' });

 
    if (category.source === 'global') return res.status(403).json({ message: 'cannot edit global category' });

   
    if (String(category.user_id) !== userId) return res.status(403).json({ message: 'not allowed' });

    const { name, type, parent_id } = req.body;
    const updates = {};

 
    if (name !== undefined) {
      const n = String(name).trim();
      if (!n) return res.status(400).json({ message: 'name cannot be empty' });
      updates.name = n;
    }

  
    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'invalid type' });
      updates.type = type;
    }

   
    if (parent_id !== undefined) {
      if (!parent_id) {
        updates.parent_id = null;
      } else {
        if (!isValidId(parent_id)) return res.status(400).json({ message: 'invalid parent_id' });
        
        const parent = await Category.findById(parent_id).lean();
        if (!parent) return res.status(400).json({ message: 'parent not found' });

       
        const parentAllowed = parent.source === 'global' || (parent.source === 'user' && String(parent.user_id) === userId);
        if (!parentAllowed) return res.status(403).json({ message: 'cannot use selected parent' });

    
        if (String(parent._id) === String(id)) return res.status(400).json({ message: 'cannot set parent to self' });


        let cur = parent;
        while (cur && cur.parent_id) {
          if (String(cur.parent_id) === String(id)) {
            return res.status(400).json({ message: 'invalid parent: would create cycle' });
          }
          cur = await Category.findById(cur.parent_id).lean();
        }

        updates.parent_id = mongoose.Types.ObjectId(parent_id);
      }
    }

  
    Object.assign(category, updates);
    await category.save();

    return res.json({ message: 'category updated', category });
  } catch (err) {
    console.error('updateCategory error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}




const deleteCategory = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized' });
    const userId = String(req.user._id);
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ message: 'invalid id' });

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'category not found' });

    if (category.source === 'global') return res.status(403).json({ message: 'cannot delete global category' });
    if (String(category.user_id) !== userId) return res.status(403).json({ message: 'not allowed' });

   
    await Category.updateMany(
      { parent_id: id },   
      { $set: { parent_id: null } }
    );

  
    await Transaction.updateMany(
      { category_id: id }, 
      { $set: { category_id: null } }
    );

   
    await Category.deleteOne({ _id: id });

    return res.json({ message: 'category deleted; children promoted; transactions uncategorized' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getCategories=async(req,res)=>{
    try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized' });
    const userId = req.user._id;
    const Category = require('../models/Category');
    const categories = await Category.find({
      $or: [
        { source: 'global' },
        { source: 'user', user_id: userId }
      ]
    }).sort({ name: 1 }).lean();
    return res.json({ total: categories.length, categories });
  } catch (err) {
    console.error('GET /api/categories error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories
};