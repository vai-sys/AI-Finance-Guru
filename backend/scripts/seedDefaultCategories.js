
const mongoose = require('mongoose');
const Category = require('../models/Category'); 
require('dotenv').config();

const defaults = [
  { name: 'Food', type: 'expense' },
  { name: 'Groceries', type: 'expense', parentName: 'Food' },
  { name: 'Restaurants', type: 'expense', parentName: 'Food' },
  { name: 'Travel', type: 'expense' },
  { name: 'Transport', type: 'expense', parentName: 'Travel' },
  { name: 'Rent', type: 'expense' },
  { name: 'Utilities', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Salary', type: 'income' },
  { name: 'Investment Income', type: 'income' }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

 
  const nameToId = {};


  for (const item of defaults) {
 
    const exists = await Category.findOne({ name: item.name, source: 'global' }).lean();
    if (exists) {
      nameToId[item.name] = exists._id;
      continue;
    }
    const parent_id = item.parentName ? nameToId[item.parentName] || null : null;
    const doc = new Category({
      name: item.name,
      type: item.type,
      parent_id: parent_id || null,
      source: 'global',
      user_id: null
    });
    await doc.save();
    nameToId[item.name] = doc._id;
  }

  console.log('Default categories seeded');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
