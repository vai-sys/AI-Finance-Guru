// controllers/importController.js
const path = require('path');
const fs = require('fs');
const Import = require('../models/Import');
const ImportItem = require('../models/ImportItem');
const Transaction = require('../models/Transaction');
const importQueue = require('../lib/queue');
const mongoose = require('mongoose');


async function uploadImport(req, res) {
  try {
   
    if (!req.user || !req.user._id) {
      console.warn('uploadImport called without auth - req.user is missing');
      return res.status(401).json({ message: 'Unauthorized: user not found. Make sure you are logged in.' });
    }

    const userId = req.user._id;
    const file = req.file;
    if (!file) {
      console.warn('uploadImport called without file - req.file is missing');
      return res.status(400).json({ message: 'file required' });
    }

    const imp = await Import.create({
      user_id: userId,
      filename: file.originalname,
      filepath: file.path,
      status: 'pending'
    });

    await importQueue.add('process-import', { importId: imp._id.toString(), filepath: file.path, userId: userId.toString() });

    return res.status(201).json({ importId: imp._id, message: 'Upload accepted and queued for processing' });
  } catch (err) {
    console.error('uploadImport error', err);
    return res.status(500).json({ message: 'upload failed', error: err.message });
  }
}


/**
 * GET /api/imports/:id/items
 * - return Import info + ImportItems
 */
async function getImportItems(req, res) {
  try {
    const importId = req.params.id;
    const imp = await Import.findById(importId).lean();
    if (!imp) return res.status(404).json({ message: 'import not found' });
    if (String(imp.user_id) !== String(req.user._id)) return res.status(403).json({ message: 'forbidden' });

    const items = await ImportItem.find({ import_id: importId }).lean();
    return res.json({ import: imp, items });
  } catch (err) {
    console.error('getImportItems error', err);
    return res.status(500).json({ message: 'failed to fetch import items' });
  }
}

/**
 * PATCH /api/imports/:importId/items/:itemId
 * - update extracted fields or mark rejected
 * - body: { extracted: {...}, status: 'pending'|'rejected' }
 */
async function updateImportItem(req, res) {
  try {
    const { importId, itemId } = req.params;
    const imp = await Import.findById(importId);
    if (!imp) return res.status(404).json({ message: 'import not found' });
    if (String(imp.user_id) !== String(req.user._id)) return res.status(403).json({ message: 'forbidden' });

    const payload = {};
    if (req.body.extracted) payload.extracted = req.body.extracted;
    if (req.body.status) payload.status = req.body.status;

    const updated = await ImportItem.findOneAndUpdate({ _id: itemId, import_id: importId }, { $set: payload }, { new: true });
    if (!updated) return res.status(404).json({ message: 'item not found' });
    return res.json({ item: updated });
  } catch (err) {
    console.error('updateImportItem error', err);
    return res.status(500).json({ message: 'failed to update item' });
  }
}

/**
 * POST /api/imports/:id/confirm
 * - commit pending items into transactions
 * - idempotent: skip items that already have transactions with meta.import_item_id
 */
async function confirmImport(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const importId = req.params.id;
    const imp = await Import.findById(importId).session(session);
    if (!imp) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'import not found' });
    }
    if (String(imp.user_id) !== String(req.user._id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'forbidden' });
    }

    const pendingItems = await ImportItem.find({ import_id: importId, status: 'pending' }).session(session);
    const toInsert = [];
    const committedItemIds = [];

    for (const item of pendingItems) {
      const already = await Transaction.findOne({ 'meta.import_item_id': item._id }).session(session);
      if (already) {
        // mark as committed if it was previously inserted
        await ImportItem.findByIdAndUpdate(item._id, { status: 'committed' }).session(session);
        committedItemIds.push(item._id);
        continue;
      }

      // normalize values
      const amount = item.extracted?.amount != null ? Number(String(item.extracted.amount).replace(/[^0-9.-]/g, '')) : 0;
      const date = item.extracted?.date ? new Date(item.extracted.date) : new Date();
      const description = (item.extracted?.description || '').toString().trim();

      const tx = {
        user_id: imp.user_id,
        amount,
        currency: item.extracted?.currency || 'INR',
        date,
        description,
        category_id: item.extracted?.category_suggestion || null,
        source: 'import',
        tags: item.extracted?.tags || [],
        meta: {
          import_item_id: item._id,
          import_id: importId,
          raw: item.raw
        }
      };

      toInsert.push(tx);
    }

    let inserted = [];
    if (toInsert.length) {
      // insertMany in session
      inserted = await Transaction.insertMany(toInsert, { session, ordered: false });
      // collect inserted meta.import_item_id (Transaction.meta.import_item_id uses original item._id)
      inserted.forEach(i => {
        if (i.meta && i.meta.import_item_id) committedItemIds.push(String(i.meta.import_item_id));
      });
    }

    // Mark import items as committed
    if (committedItemIds.length) {
      await ImportItem.updateMany({ _id: { $in: committedItemIds } }, { $set: { status: 'committed' } }).session(session);
    }

    // update import summary
    const summary = imp.result_summary || {};
    summary.committed = (summary.committed || 0) + inserted.length;
    await Import.findByIdAndUpdate(importId, { status: 'done', result_summary: summary }).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.json({ committed: inserted.length, skipped: pendingItems.length - inserted.length });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('confirmImport error', err);
    // preserve import error state
    try { await Import.findByIdAndUpdate(req.params.id, { status: 'failed', error: err.message }); } catch(e){/* ignore */ }
    return res.status(500).json({ message: 'confirm failed', error: err.message });
  }
}

module.exports = {
  uploadImport,
  getImportItems,
  updateImportItem,
  confirmImport
};
