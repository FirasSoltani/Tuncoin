/***** GLOBAL IMPORTS *****/
const { hash } = require('bcrypt');
const express = require('express');
const router = express.Router();

/***** FUNCTIONS IMPORT *****/
const { transaction, buy, history, getBalance } = require('../functions/transaction');

/***** METHODES GOES HERE *****/
/* Transaction */
router.post('/transaction', transaction);
router.post('/buy', buy);
router.get('/history', history);
router.get('/getBalance', getBalance);

module.exports = router;