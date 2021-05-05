/***** GLOBAL IMPORTS *****/
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var cors = require('cors');
var Web3 = require("web3");
var metaCoinArtifact = require("../build/contracts/TuniCoin.json");
const router = express.Router();

const {index, getGas, createAccount, send, getEth, getBalance, transactionInfo, myAccount, changeAccount, history} = require("../functions/blockchain");

router.get('/index', index);
router.get('/createAccount', createAccount);
router.post('/send', send);
router.get('/balance', getBalance);
router.get('/gas', getGas);
router.get('/getEth', getEth);
router.get('/transactionInfo', transactionInfo);
router.get('/account/get', myAccount);
router.post('/account/set', changeAccount);
router.get('/history', history);

module.exports = router;
