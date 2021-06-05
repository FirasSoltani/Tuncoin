/***** GLOBAL IMPORTS *****/
const { hash } = require("bcrypt");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailgun = require("mailgun-js");
const firebaseAdmin = require("firebase-admin");
var metaCoinArtifact = require("../build/contracts/TuniCoin.json");
var Web3 = require("web3");
var Tx = require("ethereumjs-tx").Transaction;
/***** BLOCKCHAIN CONFIG *****/
exports.blockchainMethods = blockchainConfig = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/d595e4c3fc6d41218e7193c1ecc2f6a8")
    );
    try {
      // get contract instance
      const networkId = await this.web3.eth.net.getId();
      const deployedNetwork = metaCoinArtifact.networks[networkId];
      this.meta = new this.web3.eth.Contract(
        metaCoinArtifact.abi,
        deployedNetwork.address
      );
      /* const ethaccounts = await this.web3.eth.getAccounts();
       console.log(ethaccounts);
       this.account = ethaccounts[0];
       this.refreshBalance(this.account);*/
      const acc = this.web3.eth.accounts.privateKeyToAccount(
        "871e743d97cdfdadf973dc783cfa4726a7d77a00d34964f44dfd9f134417519d"
      );
      this.account = acc;
    } catch (error) {
      console.log(error);
    }
  },

  loginToAccount: async function (privateKey) {
    try {
      return this.web3.eth.accounts.privateKeyToAccount(privateKey);
    } catch {

      console.log("false: " + privateKey);
    }
  },

  createAccount: async function () {
    let account = this.web3.eth.accounts.create();
    console.log("account" + account);
    return account;
  },

  refreshBalance: async function (address) {
    const { balanceOf } = this.meta.methods;
    const balance = await balanceOf(address).call();
    console.log(balance);
    return balance;
  },


  sendCoin: async function (receiver, sender, amount) {
    const { transfer } = this.meta.methods;
    const tx = await transfer(receiver, amount);
    const rawTx = {
      nonce: await this.web3.eth.getTransactionCount(sender.address, "pending"),
      from: sender.address,
      to: this.meta._address,
      gasPrice: this.web3.utils.toHex(this.web3.utils.toWei("50", "gwei")),
      gasLimit: this.web3.utils.toHex(2100000),
      value: "0x0",
      chainId: this.web3.utils.toHex(3),
      data: tx.encodeABI(),
    };
    console.log(rawTx);
    const finalTx = new Tx(rawTx, {
      chain: "ropsten",
    });
    finalTx.sign(Buffer.from(sender.privateKey.substring(2), "hex"));
    await this.web3.eth
      .sendSignedTransaction("0x" + finalTx.serialize().toString("hex"))
      .once("transactionHash", function (hash) {
        console.log("txHash", hash);
      })
      .once("receipt", function (receipt) {
        console.log("receipt", receipt);
      })
      .on("confirmation", function (confNumber, receipt) {
        console.log("confNumber", confNumber, "receipt", receipt);
      })
      .on("error", function (error) {
        console.log("error", error);
      })
      .then(function (receipt) {
        console.log("trasaction mined!", receipt);
      });
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