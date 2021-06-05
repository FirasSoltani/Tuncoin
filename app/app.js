/***** GLOBAL IMPORTS *****/
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var cors = require('cors');
var Web3 = require("web3");
var metaCoinArtifact = require("../build/contracts/TuniCoin.json");
var session = require("express-session");
var Tx = require("ethereumjs-tx").Transaction;
const { v4: uuidv4 } = require("uuid");

/***** UTILS CONFIG *****/
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

/***** HEADER CONFIG *****
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Header", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method == 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        res.status(200).json({});
    }
});*/

/***** DATABASE CONNECTION *****/
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/***** SESSION CONFIG ******/
app.use(
    session({
      genid: function () {
        return uuidv4();
      },
      secret: "tunicoin_pim",
      resave: false,
      name: "tunicoin",
      saveUninitialized: true,
      cookie: { secure: false },
    })
  );
  app.use((req, res, next) => {
    // Check if we've already initialised a session
    if (!req.session.address) {
      // Initialise our variables on the session object (that's persisted across requests by the same user
      req.session.address = {};
    }
    next();
  });

/***** ROUTES IMPORT *****/
const usersRoutes = require('./routes/userRoutes');
const cryptocurrencyRoutes = require('./routes/cryptocurrencyRoutes');
const transactionRoutes = require('./routes/transactionRoutes')
//const blockchainRoutes = require('./routes/blockchainRoutes')

/***** ROUTES *****/
app.use('/auth', usersRoutes);
app.use('/transaction', transactionRoutes);
app.use('/cryptocurrency', cryptocurrencyRoutes);
//app.use('/blockchain', blockchainRoutes);

module.exports = app;





