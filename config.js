/***** GLOBAL IMPORTS *****/
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var cors = require('cors');
var Web3 = require("web3");
var metaCoinArtifact = require("../build/contracts/TuniCoin.json");

/***** BLOCKCHAIN CONFIG *****/
module.exports =  blockchainConfig = {
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
        //console.error("Could not connect to contract or chain.");
      }
    },
  
    refreshBalance: async function (address) {
      const { balanceOf } = this.meta.methods;
      const balance = await balanceOf(address).call();
      console.log(balance);
      return balance;
    },
  
    createAccount: async function () {
      let account = this.web3.eth.accounts.create();
      return account.address;
    },
  
    sendCoin: async function (receiver, amount) {
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
        address: "0xb886dd58fad4c35c1dfa27ebe52b8e2131de4370",
      });
    },
  };
  