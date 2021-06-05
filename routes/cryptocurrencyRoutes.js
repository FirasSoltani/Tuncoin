const express = require('express');
const router = express.Router();
const { cryptocurrencyValues, cryptocurrencyNews } = require("../functions/currency");

/***** FUNCTIONS IMPORT *****/
router.get('/values', cryptocurrencyValues );
router.get('/news', cryptocurrencyNews);

module.exports = router;