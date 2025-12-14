
// require('dotenv').config();
// const mongoose = require('mongoose');
// const importQueue = require('../lib/queue');
// const Import = require('../models/Import');
// const ImportItem = require('../models/ImportItem');
// const fs = require('fs');
// const { parse: csvParse } = require('csv-parse/sync');
// const xlsx = require('xlsx');
// const path = require('path');
// const { parsePdfWithOcr } = require('../lib/ocr');

// const MONGO = process.env.MONGO_URI;


// mongoose.connect(MONGO)
//   .then(() => console.log('Worker connected to Mongo'))
//   .catch(err => { console.error('Worker Mongo connection error', err); process.exit(1); });

// importQueue.process('process-import', 2, async (job) => {
//   const { importId, filepath, userId } = job.data;
//   try {
//     console.log('Processing import job', importId, filepath);
//     await Import.findByIdAndUpdate(importId, { status: 'processing' });

//     const ext = path.extname(filepath).toLowerCase().replace('.', '');
//     let parsedItems = [];

//     if (ext === 'csv' || ext === 'txt') {
//       const content = fs.readFileSync(filepath, 'utf8');
  
//       const rows = csvParse(content, { columns: true, skip_empty_lines: true, trim: true });
//       parsedItems = rows.map(r => normalizeCsvRow(r));
//     } else if (ext === 'xls' || ext === 'xlsx') {
//       const wb = xlsx.readFile(filepath);
//       const sheet = wb.Sheets[wb.SheetNames[0]];
//       const rows = xlsx.utils.sheet_to_json(sheet || {}, { defval: null });
//       parsedItems = rows.map(r => normalizeCsvRow(r));
//     } else if (ext === 'pdf') {
//       const ocrRows = await parsePdfWithOcr(filepath); 
//       parsedItems = ocrRows.map(r => ({
//         raw: r.original_raw || r,
//         extracted: {
//           date: r.date || null,
//           amount: (typeof r.amount === 'number') ? r.amount : tryParseAmount(r.amount),
//           description: (r.description || '').toString().trim(),
//           vendor: r.vendor || null,
//           account: r.account || null,
//           currency: r.currency || 'INR'
//         },
//         confidence: r.confidence || null
//       }));
//     } else {
//       throw new Error('unsupported file extension: ' + ext);
//     }

  
//     function suggestCategorySimple(extracted) {
//       const desc = (extracted.description || '').toLowerCase();
//       if (!desc) return null;
    
//       if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('dominos')) return null;
//       if (desc.includes('uber') || desc.includes('ola')) return null;
//       return null;
//     }

//     const docs = parsedItems.map(it => ({
//       import_id: importId,
//       raw: it.raw,
//       extracted: Object.assign({}, it.extracted, { category_suggestion: suggestCategorySimple(it.extracted) }),
//       status: 'pending',
//       confidence: it.confidence || null,
//       created_at: new Date()
//     }));

  
//     const created = await ImportItem.insertMany(docs, { ordered: false });

  
//     const summary = { total: parsedItems.length, parsed: created.length };
//     await Import.findByIdAndUpdate(importId, { status: 'done', result_summary: summary });

//     console.log('Import processed', importId, 'items:', created.length);
//     return Promise.resolve();
//   } catch (err) {
//     console.error('importWorker error', err);
//     try { await Import.findByIdAndUpdate(job.data.importId, { status: 'failed', error: err.message }); } catch (e) { }
//     return Promise.reject(err);
//   } finally {
    
//   }
// });


// function normalizeCsvRow(row) {
//   // case-insensitive getter for common keys
//   const get = (keys) => {
//     const lowered = Object.keys(row).reduce((acc, k) => { acc[k.toLowerCase()] = row[k]; return acc; }, {});
//     for (const k of keys) {
//       if (k in lowered && lowered[k] != null && String(lowered[k]).trim() !== '') return lowered[k];
//     }
//     return null;
//   };

//   const dateRaw = get(['date', 'transaction_date', 'txn_date', 'posted_date', 'date1', 'date2']);
//   const amountRaw = get(['amount', 'amt', 'value', 'debit', 'credit', 'amount_inr']);
//   const desc = get(['description', 'details', 'narration', 'remarks', 'particulars', 'description1']);
//   const vendor = get(['vendor', 'merchant', 'counterparty']);
//   const account = get(['account', 'account_no', 'acct']);

//   const amount = tryParseAmount(amountRaw);
//   const date = tryParseDate(dateRaw);

//   return {
//     raw: row,
//     extracted: {
//       date,
//       amount,
//       description: (desc || '').toString().trim(),
//       vendor: vendor || null,
//       account: account || null,
//       currency: get(['currency', 'curr', 'ccy']) || 'INR'
//     },
//     confidence: null
//   };
// }


// function tryParseAmount(v) {
//   if (v == null) return null;
//   if (typeof v === 'number') return v;
//   const s = String(v).trim();
//   if (s === '') return null;
 
//   const paren = /^\((.*)\)$/.exec(s);
//   const core = paren ? paren[1] : s;

//   const cleaned = core.replace(/[₹,$\s]/g, '').replace(/,/g, '');
//   const n = Number(cleaned);
//   if (Number.isNaN(n)) return null;
//   return paren ? -n : n;
// }


// function tryParseDate(v) {
//   if (!v) return null;
//   if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
//   const s = String(v).trim();
//   if (s === '') return null;


//   const iso = new Date(s);
//   if (!Number.isNaN(iso.getTime())) return iso;


//   const m = s.match(/^(\d{1,2})[\/\-\.\s](\d{1,2})[\/\-\.\s](\d{2,4})$/);
//   if (m) {
//     let day = m[1].padStart(2, '0');
//     let mon = m[2].padStart(2, '0');
//     let year = m[3];
//     if (year.length === 2) year = '20' + year;
//     const isoStr = `${year}-${mon}-${day}`;
//     const d = new Date(isoStr);
//     if (!Number.isNaN(d.getTime())) return d;
//   }

 
//   return null;
// }



// worker/importWorker.js
require('dotenv').config();
const mongoose = require('mongoose');
const importQueue = require('../lib/queue');
const Import = require('../models/Import');
const ImportItem = require('../models/ImportItem');
const fs = require('fs');
const { parse: csvParse } = require('csv-parse/sync');
const xlsx = require('xlsx');
const path = require('path');
const { parsePdfWithOcr } = require('../lib/ocr');

const MONGO = process.env.MONGO_URI;

mongoose.connect(MONGO)
  .then(() => console.log('Worker connected to Mongo'))
  .catch(err => { console.error('Worker Mongo connection error', err); process.exit(1); });

importQueue.process('process-import', 2, async (job) => {
  const { importId, filepath, userId } = job.data;
  try {
    console.log('Processing import job', importId, filepath);
    await Import.findByIdAndUpdate(importId, { status: 'processing' });

    const ext = path.extname(filepath).toLowerCase().replace('.', '');
    let parsedItems = [];

    if (ext === 'csv' || ext === 'txt') {
      const content = fs.readFileSync(filepath, 'utf8');
      const rows = csvParse(content, { columns: true, skip_empty_lines: true, trim: true });
      parsedItems = rows.map(r => normalizeCsvRow(r));
    } else if (ext === 'xls' || ext === 'xlsx') {
      const wb = xlsx.readFile(filepath);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet || {}, { defval: null });
      parsedItems = rows.map(r => normalizeCsvRow(r));
    } else if (ext === 'pdf') {
      const ocrRows = await parsePdfWithOcr(filepath); // array of {date,amount,description,original_raw,confidence}
      parsedItems = ocrRows.map(r => ({
        raw: r.original_raw || r,
        extracted: {
          date: r.date || null,
          amount: (typeof r.amount === 'number') ? r.amount : tryParseAmount(r.amount),
          description: cleanDescription(r.description || ''),
          vendor: r.vendor || null,
          account: r.account || null,
          currency: r.currency || 'INR'
        },
        confidence: r.confidence || null
      }));
    } else {
      throw new Error('unsupported file extension: ' + ext);
    }

    function suggestCategorySimple(extracted) {
      const desc = (extracted.description || '').toLowerCase();
      if (!desc) return null;
      if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('dominos')) return null;
      if (desc.includes('uber') || desc.includes('ola')) return null;
      return null;
    }

    // Filter out non-transaction rows (keep only rows with date or amount)
    const docs = parsedItems
      .filter(it => it && it.extracted && (it.extracted.date || (typeof it.extracted.amount === 'number' && !Number.isNaN(it.extracted.amount))))
      .map(it => ({
        import_id: importId,
        raw: it.raw,
        extracted: Object.assign({}, it.extracted, { category_suggestion: suggestCategorySimple(it.extracted) }),
        status: 'pending',
        confidence: it.confidence || null,
        created_at: new Date()
      }));

    if (!docs.length) {
      await Import.findByIdAndUpdate(importId, { status: 'done', result_summary: { total: parsedItems.length, parsed: 0 } });
      console.log('No transaction rows found for import', importId);
      return Promise.resolve();
    }

    const created = await ImportItem.insertMany(docs, { ordered: false });
    const summary = { total: parsedItems.length, parsed: created.length };
    await Import.findByIdAndUpdate(importId, { status: 'done', result_summary: summary });

    console.log('Import processed', importId, 'items:', created.length);
    return Promise.resolve();
  } catch (err) {
    console.error('importWorker error', err);
    try { await Import.findByIdAndUpdate(job.data.importId, { status: 'failed', error: err.message }); } catch (e) { /* ignore */ }
    return Promise.reject(err);
  } finally {
    // keep source files for audit
  }
});

/* ---------- helpers used by worker ---------- */

function tryParseAmount(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  if (s === '') return null;
  const paren = /^\((.*)\)$/.exec(s);
  const core = paren ? paren[1] : s;
  const cleaned = core.replace(/[₹,$\s]/g, '').replace(/,/g, '');
  const n = Number(cleaned);
  if (Number.isNaN(n)) return null;
  return paren ? -n : n;
}

function tryParseDate(v) {
  if (!v) return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()));
  const s = String(v).trim();
  if (s === '') return null;

  // ISO parse first
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return new Date(Date.UTC(iso.getFullYear(), iso.getMonth(), iso.getDate()));

  // dd/mm/yyyy or d/m/yy
  const m = s.match(/^(\d{1,2})[\/\-\.\s](\d{1,2})[\/\-\.\s](\d{2,4})$/);
  if (m) {
    let day = parseInt(m[1], 10);
    let mon = parseInt(m[2], 10);
    let year = m[3];
    if (year.length === 2) year = '20' + year;
    year = parseInt(year, 10);
    return new Date(Date.UTC(year, mon - 1, day));
  }
  return null;
}

function cleanDescription(desc) {
  return desc.toString().replace(/\b(Debit|Credit)\b/ig, '').trim();
}

function normalizeCsvRow(row) {
  // case-insensitive getter for common keys
  const lowered = Object.keys(row || {}).reduce((acc, k) => { acc[k.toLowerCase()] = row[k]; return acc; }, {});
  const get = (keys) => {
    for (const k of keys) {
      if (k in lowered && lowered[k] != null && String(lowered[k]).trim() !== '') return lowered[k];
    }
    return null;
  };

  const dateRaw = get(['date', 'transaction_date', 'txn_date', 'posted_date', 'Date']);
  const amountRaw = get(['amount', 'amt', 'value', 'debit', 'credit', 'Amount']);
  const desc = get(['description', 'details', 'narration', 'remarks', 'particulars', 'Description']);
  const vendor = get(['vendor', 'merchant', 'counterparty']);
  const account = get(['account', 'account_no', 'acct']);

  const amount = tryParseAmount(amountRaw);
  const date = tryParseDate(dateRaw);

  return {
    raw: row,
    extracted: {
      date,
      amount,
      description: cleanDescription(desc || ''),
      vendor: vendor || null,
      account: account || null,
      currency: get(['currency', 'curr', 'ccy']) || 'INR'
    },
    confidence: null
  };
}
