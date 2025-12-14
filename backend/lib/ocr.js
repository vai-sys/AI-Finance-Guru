const { execFileSync } = require('child_process');
const glob = require('glob');
const fs = require('fs');
const Tesseract = require('tesseract.js');

/**
 * Main OCR / PDF parsing entry
 */
async function parsePdfWithOcr(pdfPath) {
  const outPrefix =
    `${process.platform === 'win32' ? 'C:\\Windows\\Temp' : '/tmp'}/ocr-${Date.now()}`;

  // 1️⃣ Try OCR (scanned PDFs)
  try {
    execFileSync('pdftoppm', ['-png', pdfPath, outPrefix], { stdio: 'ignore' });
    console.log('OCR: pdftoppm succeeded, running Tesseract');

    const images = glob.sync(`${outPrefix}-*.png`);
    if (!images.length) throw new Error('No images generated');

    const rows = [];
    for (const img of images) {
      const { data: { text } } = await Tesseract.recognize(img, 'eng');
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const parsed = parseLineToRow(line);
        if (parsed) rows.push(parsed);
      }
    }
    return rows;
  } catch (err) {
    console.warn('OCR unavailable, falling back to pdf-parse:', err.message);

    // 2️⃣ Fallback: text-based PDFs
    let pdfParse;
    try {
      const mod = require('pdf-parse');
      pdfParse = typeof mod === 'function' ? mod : mod.default;
    } catch {
      throw new Error('pdf-parse not installed');
    }

    const buffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(buffer);
    const lines = (data.text || '').split('\n').map(l => l.trim()).filter(Boolean);

    const rows = [];
    for (const line of lines) {
      const parsed = parseLineToRow(line);
      if (parsed) rows.push(parsed);
    }
    return rows;
  }
}

/* ================= HELPERS ================= */

// Example:
// 02/01/2025 ATM Withdrawal Debit 2,000.00
const ROW_REGEX =
  /^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\s+(.+?)\s+(?:Debit|Credit)?\s*([-\d,\.₹]+)$/i;

/**
 * Parse one statement line into structured data
 */
function parseLineToRow(line) {
  const match = line.match(ROW_REGEX);
  if (!match) return null;

  const rawDate = match[1];
  const rawDesc = match[2];
  const rawAmount = match[3];

  // Detect direction
  let direction = null;
  if (/credit/i.test(line)) direction = 'credit';
  else if (/debit/i.test(line)) direction = 'debit';

  let amount = parseAmount(rawAmount);
  if (typeof amount !== 'number') return null;

  // Encode direction into sign
  if (direction === 'debit') amount = -Math.abs(amount);
  if (direction === 'credit') amount = Math.abs(amount);

  const date = parseIndianDate(rawDate);
  if (!date) return null;

  const description = rawDesc.replace(/\b(Debit|Credit)\b/ig, '').trim();

  return {
    date,
    amount,
    description,
    original_raw: line,
    confidence: null
  };
}

/**
 * Parse currency safely
 */
function parseAmount(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;

  const cleaned = String(v)
    .replace(/[₹,\s]/g, '')
    .replace(/,/g, '');

  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

/**
 * STRICT DD/MM/YYYY parser (Indian format)
 */
function parseIndianDate(v) {
  if (!v) return null;

  const m = String(v).trim().match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (!m) return null;

  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const year = parseInt(m[3], 10);

  return new Date(Date.UTC(year, month, day));
}

module.exports = { parsePdfWithOcr };
