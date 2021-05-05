/***** GLOBAL IMPORTS *****/
const { hash } = require("bcrypt");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailgun = require("mailgun-js");
const firebaseAdmin = require("firebase-admin");
var metaCoinArtifact = require("../../build/contracts/TuniCoin.json");
var Web3 = require("web3");
/***** BLOCKCHAIN CONFIG *****/
exports.blockchainMethods = blockchainConfig = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545")
    );
    try {
      // get contract instance
      const networkId = await this.web3.eth.net.getId();
      const deployedNetwork = metaCoinArtifact.networks[networkId];
      this.meta = new this.web3.eth.Contract(
        metaCoinArtifact.abi,
        deployedNetwork.address
      );
      const ethaccounts = await this.web3.eth.getAccounts();
      console.log(ethaccounts);
      this.account = ethaccounts[0];
      this.refreshBalance(this.account);
    } catch (error) {
      console.log(error);
    }
  },

  createAccount: async function () {
    let account = this.web3.eth.accounts.create();
    return account.address;
  },

  refreshBalance: async function (address) {
    const { balanceOf } = this.meta.methods;
    const balance = await balanceOf(address).call();
    console.log(balance);
    return balance;
  },


  sendCoin: async function ( receiver, amount) {
    console.log("account: "+  this.account);
    const { transfer } = this.meta.methods;
    await transfer(receiver, amount)
      .send({ from: this.account })
      .then(console.log);
    return true;
  },

  getGasPrice: async function () {
    return this.web3.eth.getGasPrice();
  },

  getEthBalance: async function (address) {
    return this.web3.eth.getBalance(address);
  },

  getTransaction: async function (transaction) {
    return this.web3.eth.getTransaction(transaction);
  },

  getAccount: async function () {
    return this.account;
  },

  getHistory: async function (address) {
    let array = [];
    return this.web3.eth.getPastLogs({
      fromBlock: "0x0",
      address: address,
    });
  },
};
/*
exports.getBalance = (address, res) => {
  blockchainConfig.start();
  balance = blockchainConfig.refreshBalance(address);
  balance.then((value) => {
    res.json({ balance: value });
  });
};

exports.createAccount = ( res) => {
  blockchainConfig.start();
  address = blockchainConfig.createAccount();
  console.log(address);
  address.then((value) => {
    res.send(value);
    console.log("value: "+value);
  });
};

exports.send = (sender, receiver, amount, res) => {
  blockchainConfig.start();
  console.log(req);
  Success = blockchainConfig.sendCoin(receiver, amount);
  if (Success) {
    blockchainConfig.refreshBalance(sender).then((value) => {
      res.json({ return: value });
    });
  } else {
    res.json({ return: "failed" });
  }
};


exports.getGas = (req, res) => {
  blockchainConfig.start();
  gas = blockchainConfig.getGasPrice();
  gas.then((value) => {
    res.json({ gas: value });
  });
};

exports.getEth = (req, res) => {
  blockchainConfig.start();
  balance = blockchainConfig.getEthBalance(blockchainConfig.account);
  balance.then((value) => {
    res.json({ eth: value });
  });
};


exports.myAccount = (res) => {
  blockchainConfig.start();
  blockchainConfig.getAccount().then((value) => {
    res.json({ account: value });
    console.log("value:" + value);
  });
};

exports.changeAccount = (accountAddress) => {
  blockchainConfig.start();
  blockchainConfig.account = accountAddress;
  //res.json({ account: blockchainConfig.account });
};

exports.transactionInfo = (req, res) => {
  blockchainConfig.start();
  transaction = blockchainConfig.getTransaction(req.body.transaction);
  transaction.then((value) => {
    res.json({ result: value });
  });
};

exports.history = (req, res) => {
  blockchainConfig.start();
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
}; */