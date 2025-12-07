const express = require('express');
const router = express.Router();

const {auth} = require('../middlewares/authMiddleware.js');  
const {
    createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById
} = require('../controllers/categoryController');




router.get('/', auth, getCategories);

router.post('/', auth,createCategory);


router.put('/:id', auth, updateCategory);


router.delete('/:id', auth, deleteCategory);

router.get('/:id',auth,getCategoryById)
module.exports = router;
