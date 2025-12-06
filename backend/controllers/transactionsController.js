
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');


const sanitizeTags = (tags) => {
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string' && tags.trim().length) {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
};

const createTransaction = async (req, res) => {
  try {
   
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user._id;

 
    const { amount, date, description, category_id, tags, currency, source, meta } = req.body;

 
    if (amount === undefined || amount === null || date === undefined || date === null) {
      return res.status(400).json({ message: 'amount and date are required' });
    }

   
    const numAmount = Number(amount);
    if (Number.isNaN(numAmount) || !isFinite(numAmount)) {
      return res.status(400).json({ message: 'amount must be a valid number' });
    }


    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'invalid date format' });
    }

   
    const sanitizedTags = sanitizeTags(tags);

  
    let categoryObjectId = null;
    if (category_id) {
      if (!mongoose.Types.ObjectId.isValid(category_id)) {
        return res.status(400).json({ message: 'invalid category_id' });
      }
      categoryObjectId =  new mongoose.Types.ObjectId(category_id);

     
      const category = await Category.findById(categoryObjectId).lean();
      if (!category) {
        return res.status(400).json({ message: 'category not found' });
      }

      const isGlobal = category.source === 'global';
      const isOwnedByUser = category.source === 'user' && String(category.user_id) === String(userId);

      if (!isGlobal && !isOwnedByUser) {
        return res.status(403).json({ message: 'category does not belong to user' });
      }
    }

    
    const payload = {
      user_id: userId,
      amount: numAmount,
      currency: currency || 'INR',
      date: parsedDate,
      description: description ? String(description).trim() : '',
      category_id: categoryObjectId,
      source: source || 'manual',
      tags: sanitizedTags,
      meta: meta || {}
    };

    const transaction = new Transaction(payload);
    await transaction.save();

    return res.status(201).json({ message: 'Transaction created successfully', transaction });
  } catch (err) {
    console.error('createTransaction error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getTransactions = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user._id;

  
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

   
   const filter = { user_id: new mongoose.Types.ObjectId(userId) };

  
    const { startDate, endDate, category_id, tag, minAmount, maxAmount } = req.query;
    if (startDate) {
      const sd = new Date(startDate);
      if (!isNaN(sd.getTime())) {
        filter.date = filter.date || {};
        filter.date.$gte = sd;
      }
    }
    if (endDate) {
      const ed = new Date(endDate);
      if (!isNaN(ed.getTime())) {
        filter.date = filter.date || {};
        filter.date.$lte = ed;
      }
    }

  
  if (category_id) {
  if (!mongoose.Types.ObjectId.isValid(category_id)) {
    return res.status(400).json({ message: 'invalid category_id' });
  }
  filter.category_id = new mongoose.Types.ObjectId(category_id);
}

    if (tag) {
      filter.tags = { $in: [String(tag).trim()] };
    }

   
    if (minAmount !== undefined) {
      const mn = Number(minAmount);
      if (!Number.isNaN(mn)) {
        filter.amount = filter.amount || {};
        filter.amount.$gte = mn;
      }
    }
    if (maxAmount !== undefined) {
      const mx = Number(maxAmount);
      if (!Number.isNaN(mx)) {
        filter.amount = filter.amount || {};
        filter.amount.$lte = mx;
      }
    }

  
    let sort = { date: -1 }; 
    if (req.query.sortBy) {
      const field = req.query.sortBy;
      
      const direction = field.startsWith('-') ? -1 : 1;
      const key = field.replace(/^-/, '');
      sort = { [key]: direction };
    }

    
    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    return res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      transactions
    });
  } catch (err) {
    console.error('getTransactions error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};






const updateTransaction = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized' });
    const userId = String(req.user._id);
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'invalid id' });

    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ message: 'transaction not found' });
    if (String(tx.user_id) !== userId) return res.status(403).json({ message: 'not allowed' });

   
    const allowed = ['amount','date','description','category_id','tags','currency','meta','source'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
      
        if (key === 'amount') {
          const num = Number(req.body.amount);
          if (Number.isNaN(num) || !isFinite(num)) return res.status(400).json({ message: 'invalid amount' });
          tx.amount = num;
          continue;
        }
        if (key === 'date') {
          const d = new Date(req.body.date);
          if (isNaN(d.getTime())) return res.status(400).json({ message: 'invalid date' });
          tx.date = d;
          continue;
        }
        if (key === 'category_id') {
          const cid = req.body.category_id;
          if (cid === null || cid === '') {
            tx.category_id = null;
            continue;
          }
          if (!mongoose.Types.ObjectId.isValid(cid)) return res.status(400).json({ message: 'invalid category_id' });
          const category = await Category.findById(cid).lean();
          if (!category) return res.status(400).json({ message: 'category not found' });
          const isGlobal = category.source === 'global';
          const isOwnedByUser = category.source === 'user' && String(category.user_id) === userId;
          if (!isGlobal && !isOwnedByUser) return res.status(403).json({ message: 'category does not belong to user' });
          tx.category_id = mongoose.Types.ObjectId(cid);
          continue;
        }
        if (key === 'tags') {
          tx.tags = sanitizeTags(req.body.tags);
          continue;
        }
       
        tx[key] = req.body[key];
      }
    }

    await tx.save();
    return res.json({ message: 'transaction updated', transaction: tx });
  } catch (err) {
    console.error('updateTransaction error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized' });
    const userId = String(req.user._id);
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'invalid id' });

    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ message: 'transaction not found' });
    if (String(tx.user_id) !== userId) return res.status(403).json({ message: 'not allowed' });

    await Transaction.deleteOne({ _id: id });
    return res.json({ message: 'transaction deleted' });
  } catch (err) {
    console.error('deleteTransaction error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,

  updateTransaction,
  deleteTransaction
};

