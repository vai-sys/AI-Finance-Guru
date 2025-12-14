
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

/* ---------------- DB CONNECT ---------------- */
mongoose.connect(MONGO)
  .then(() => console.log('Worker connected to Mongo'))
  .catch(err => {
    console.error('Worker Mongo connection error', err);
    process.exit(1);
  });


importQueue.process('process-import', 2, async (job) => {
  const { importId, filepath } = job.data;

  try {
    console.log('Processing import job', importId, filepath);
    await Import.findByIdAndUpdate(importId, { status: 'processing' });

    const ext = path.extname(filepath).toLowerCase().replace('.', '');
    let parsedItems = [];

    if (ext === 'csv' || ext === 'txt') {
      const content = fs.readFileSync(filepath, 'utf8');
      const rows = csvParse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      parsedItems = rows.map(normalizeCsvRow);
    }

  
    else if (ext === 'xls' || ext === 'xlsx') {
      const wb = xlsx.readFile(filepath);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet || {}, { defval: null });
      parsedItems = rows.map(normalizeCsvRow);
    }

   
    else if (ext === 'pdf') {
      const ocrRows = await parsePdfWithOcr(filepath);
      parsedItems = ocrRows.map(r => ({
        raw: r.original_raw || r,
        extracted: {
          date: r.date || null,
          amount: typeof r.amount === 'number' ? r.amount : tryParseAmount(r.amount),
          description: cleanDescription(r.description || ''),
          vendor: null,
          account: null,
          currency: 'INR'
        },
        confidence: r.confidence || null
      }));
    }

    else {
      throw new Error('Unsupported file type: ' + ext);
    }

 
    function suggestCategorySimple(extracted) {
      const d = (extracted.description || '').toLowerCase();
      if (d.includes('swiggy') || d.includes('zomato')) return null;
      if (d.includes('uber') || d.includes('ola')) return null;
      return null;
    }

    
    const docs = parsedItems
      .filter(it =>
        it &&
        it.extracted &&
        it.extracted.date &&
        typeof it.extracted.amount === 'number'
      )
      .map(it => ({
        import_id: importId,
        raw: it.raw,
        extracted: {
          ...it.extracted,
          category_suggestion: suggestCategorySimple(it.extracted)
        },
        status: 'pending',
        confidence: it.confidence || null,
        created_at: new Date()
      }));

    if (!docs.length) {
      await Import.findByIdAndUpdate(importId, {
        status: 'done',
        result_summary: { total: parsedItems.length, parsed: 0 }
      });
      console.log('No valid transactions found');
      return;
    }

    const created = await ImportItem.insertMany(docs, { ordered: false });

    await Import.findByIdAndUpdate(importId, {
      status: 'done',
      result_summary: {
        total: parsedItems.length,
        parsed: created.length
      }
    });

    console.log('Import processed', importId, 'items:', created.length);

  } catch (err) {
    console.error('importWorker error', err);
    await Import.findByIdAndUpdate(importId, {
      status: 'failed',
      error: err.message
    });
    throw err;
  }
});


function normalizeCsvRow(row) {
  const lowered = Object.keys(row || {}).reduce((acc, k) => {
    acc[k.toLowerCase()] = row[k];
    return acc;
  }, {});

  const get = (keys) => {
    for (const k of keys) {
      if (k in lowered && lowered[k] != null && String(lowered[k]).trim() !== '') {
        return lowered[k];
      }
    }
    return null;
  };

  const dateRaw = get(['date', 'transaction date', 'txn_date', 'posted_date']);
  const desc = get(['description', 'narration', 'remarks', 'particulars']);
  const amountRaw = get(['amount', 'amt', 'value']);
  const directionRaw = get(['debit/credit', 'dr/cr', 'type']);

  let amount = tryParseAmount(amountRaw);
  if (typeof amount !== 'number') return null;

  if (directionRaw) {
    if (/debit/i.test(directionRaw)) amount = -Math.abs(amount);
    if (/credit/i.test(directionRaw)) amount = Math.abs(amount);
  }

  const date = tryParseDate(dateRaw);
  if (!date) return null;

  return {
    raw: row,
    extracted: {
      date,
      amount,
      description: cleanDescription(desc || ''),
      vendor: null,
      account: null,
      currency: 'INR'
    },
    confidence: null
  };
}

/* ---------- AMOUNT ---------- */
function tryParseAmount(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;

  const cleaned = String(v)
    .replace(/[₹,\s]/g, '')
    .replace(/,/g, '');

  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

/* ---------- DATE (STRICT DD/MM/YYYY FIRST) ---------- */
function tryParseDate(v) {
  if (!v) return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()));
  }

  const s = String(v).trim();

  // ✅ Indian format FIRST
  const m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year = parseInt(m[3], 10);
    return new Date(Date.UTC(year, month, day));
  }

  // fallback ISO
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) {
    return new Date(Date.UTC(
      iso.getFullYear(),
      iso.getMonth(),
      iso.getDate()
    ));
  }

  return null;
}

/* ---------- DESCRIPTION ---------- */
function cleanDescription(desc) {
  return String(desc).replace(/\b(Debit|Credit)\b/ig, '').trim();
}
