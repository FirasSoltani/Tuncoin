/***** GLOBAL IMPORTS *****/
const { hash } = require('bcrypt');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/***** MODELS IMPORT *****/
const User = require('../models/user');

/***** FUNCTIONS IMPORT *****/
const { signup, login, updatePassword, deleteAcount, getUser, activateAccount, forgotPassword, resetPassword } = require('../functions/auth');
const { transaction, buy } = require('../functions/transaction');

/***** METHODES GOES HERE *****/
/* Auth */
router.post('/signup', signup);
router.post('/login', login);
router.patch('/updatePassword', updatePassword);
router.delete('/delete', deleteAcount);
router.get('/loggedUser/:id', getUser );
router.get('/activation/:token', activateAccount);
router.put('/forgotPassword', forgotPassword);
router.put('/resetPassword', resetPassword);

/* Transaction */
router.post('/transaction', transaction);
router.post('/buy', buy);

module.exports = router;