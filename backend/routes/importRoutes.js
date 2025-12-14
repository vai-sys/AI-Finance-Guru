// routes/imports.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImport, getImportItems, updateImportItem, confirmImport } = require('../controllers/importController');

const router = express.Router();
const {auth}=require("../middlewares/authMiddleware.js")


const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'imports');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.xls', '.xlsx', '.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('file type not allowed'));
    cb(null, true);
  }
});

// Auth middleware requirement: assume req.user present
// POST /api/imports
router.post('/', auth , upload.single('file'), uploadImport);

// GET /api/imports/:id/items
router.get('/:id/items',auth , getImportItems);

// PATCH /api/imports/:importId/items/:itemId
router.patch('/:importId/items/:itemId',auth, updateImportItem);

// POST /api/imports/:id/confirm
router.post('/:id/confirm',auth, confirmImport);

module.exports = router;
