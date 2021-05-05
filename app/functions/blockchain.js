/***** GLOBAL IMPORTS *****/
const { hash } = require("bcrypt");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailgun = require("mailgun-js");
const firebaseAdmin = require("firebase-admin");
const { blockchainConfig } = require('../config');

exports.index = (req, res) => {
    balance = blockchainConfig.refreshBalance(blockchainConfig.account);
    balance.then((value) => {
      res.send("Current balance : " + value);
    });
  };

  exports.createAccount = (req, res) => {
    address = blockchainConfig.createAccount();
    console.log(address);
    address.then((value) => {
      res.send(value);
    });
  };

  exports.send = (req, res) => {
    console.log(req);
    Success = blockchainConfig.sendCoin(req.body.receiver, req.body.amount);
    if (Success) {
      blockchainConfig.refreshBalance(blockchainConfig.account).then((value) => {
        res.send("Success new balance is : " + value);
      });
    } else {
      res.send("Failed");
    }
  };

  exports.getBalance = (req, res) => {
    balance = blockchainConfig.refreshBalance(req.query.address);
    balance.then((value) => {
      res.send(value);
    });
  };

  exports.getGas = (req, res) => {
    gas = blockchainConfig.getGasPrice();
    gas.then((value) => {
      res.send(value);
    });
  };

  exports.getEth = (req, res) => {
    balance = blockchainConfig.getEthBalance(blockchainConfig.account);
    balance.then((value) => {
      res.send(value);
    });
  }; 

  exports.transactionInfo = (req, res) => {
    transaction = blockchainConfig.getTransaction(req.query.transaction);
    transaction.then((value) => {
      res.send(value);
    });
  };

  exports.myAccount = (req, res) => {
    blockchainConfig.getAccount().then((value) => {
      res.send(value);
    });
  };

  exports.changeAccount = (req, res) => {
    blockchainConfig.account = req.body.account;
    res.send("Success");
  };

  exports.history = (req, res) => {
    var history = blockchainConfig.getHistory(blockchainConfig.account);
    history.then((value) => {
      value.forEach((rec) => {
        var array = [];
        blockchainConfig.getTransaction(rec.transactionHash).then((value) => {
          if (value.from == blockchainConfig.account) array.push(value);
        });
        console.log(array);
      });
      res.send(value);
    });
  };