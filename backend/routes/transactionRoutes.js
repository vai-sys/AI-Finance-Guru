// routes/transactions.js
const express = require('express');
const router = express.Router();
const {auth} = require('../middlewares/authMiddleware.js'); 
const {
    createTransaction,
      getTransactions,
    
      updateTransaction,
      deleteTransaction
} = require('../controllers/transactionsController.js');


router.post('/', auth, createTransaction);


router.get('/', auth, getTransactions);





router.put('/:id', auth,updateTransaction);


router.delete('/:id', auth, deleteTransaction);

module.exports = router;
