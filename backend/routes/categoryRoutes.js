const express = require('express');
const router = express.Router();

const {auth} = require('../middlewares/authMiddleware.js');  
const {
    createCategory,
  updateCategory,
  deleteCategory,
  getCategories
} = require('../controllers/categoryController');




router.get('/', auth, getCategories);

router.post('/', auth,createCategory);


router.put('/:id', auth, updateCategory);


router.delete('/:id', auth, deleteCategory);

module.exports = router;
