/***** GLOBAL IMPORTS *****/
const { hash } = require("bcrypt");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailgun = require("mailgun-js");
const firebaseAdmin = require("firebase-admin");
const method = require("./blockchain");

/***** MAILGUN SETTINGS *****/
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

/***** FIREBASE NOTIFICATION SETTINGS *****/
var serviceAccount = require("../tuncoin-2021-firebase-adminsdk-1utoy-b5d8b97014.json");
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});

/***** MODELS IMPORT *****/
const User = require("../models/user");

/***** FUNCTIONS GOES HERE *****/
exports.transaction = (req, res, next) => {
  const amount = parseFloat(req.body.amount);
  const sender = req.body.sender;
  const receiver = req.body.receiver;
  User.find({ address: sender }).exec().then((doc) => {
    if (doc) {
      method.blockchainMethods.start();
      // method.blockchainMethods.ge
      Promise.resolve(method.blockchainMethods.getEthBalance(sender)).then((coins) => {
        console.log("aaaa: " + coins)
        console.log("typeof; "+typeof coins);
        const youBalance = parseFloat(coins);
        console.log("typeof2 ; "+typeof youBalance);
        if (youBalance > amount) {
          console.log("DO SOMETHING");
          //  if (doc.balance > amount) {
            const x = youBalance - amount;
            console.log("typeof X ; "+typeof x+"docs.balance: "+typeof doc.balance);
            console.log(doc.balance);
          console.log("r: "+typeof receiver+"s: "+typeof sender+"a: "+typeof amount);
            User.updateOne({ address: sender }, {
              $set: { balance: x },
              $addToSet: {
                transaction: [
                  {
                    typeTransaction: "Sending",
                    secondUser: receiver,
                    date: Date.now(),
                    amount: amount,
                  },
                ],
              },
            }, function (err, result) {
              if (err) {
                res.send(err);
              } else {
                // SEND MAIL CODE GOES HERE!
                console.log("code send mail here !");
                // SEND MAIL CODE ENDS HERE!
                console.log("update mtaa user lekher");
                User.find({ address: receiver }).exec().then((docs) => {
                  if (docs) {
                    const y = youBalance + amount;
                    User.updateOne({ address: receiver }, {
                      $set: { balance: y },
                      $addToSet: {
                        transaction: [
                          {
                            typeTransaction: "Reciving",
                            secondUser: sender,
                            date: Date.now(),
                            amount: amount,
                          },
                        ],
                      },
                    }, function (err, result) {
                      if (err) {
                        res.send(err);
                      } else {
                        // SEND MAIL CODE GOES HERE!
                        console.log("code send mail here !");
                        // SEND MAIL CODE ENDS HERE!
                        console.log("method mtaa blockchain");
                        //Promise.resolve(method.blockchainMethods.createAccount()).then((newAddress) => {console.log("aaaa: " + newAddress)});
                        method.blockchainMethods.account = sender;
                        Promise.resolve( method.blockchainMethods.sendCoin(receiver, amount)).then((bool) => {console.log("result: "+bool)});
                     console.log("B3atht ya walid ? ");
                      };
                    });
                  };
                }).catch((error) => {
                  console.log(error);
                  res.status(500).json({ error: error });
                });
              };
            });
         /* } else {
            console.log("balance chwaya");
          };*/
        } else {
          console.log("Ma aandkch flous");
        };
      });

    } else {
      console.log("user mafammesh");
    };
  }).catch((error) => {
    console.log(error);
    res.status(500).json({ error: error });
  });
}
/* NEW TRANSACTION */
exports.transaction1 = (req, res, next) => {
  const amount = parseFloat(req.body.amount);

  User.findById(req.body.idSender)
    .exec()
    .then((doc) => {
      if (doc) {
        console.log(doc);
        User.updateOne(
          { _id: req.body.idSender },
          {
            $set: { balance: doc.balance - amount },
            $addToSet: {
              transaction: [
                {
                  typeTransaction: "Sending",
                  secondUser: req.body.idReciver,
                  date: Date.now(),
                  amount: amount,
                },
              ],
            },
          },
          function (err, result) {
            if (err) {
              res.send(err);
              console.log(err);
            } else {
              User.findById(req.body.idReciver)
                .exec()
                .then((resultDoc) => {
                  if (resultDoc) {
                    const data = {
                      from: "Tuncoin Team <no-reply@tuncoin.tn>",
                      to: doc.email,
                      subject: "Transaction Successfully Completed",
                      html: `<h2> You have sent ${amount} TNC to ${resultDoc.email} </h2>              `,
                    };
                    mg.messages().send(data, function (error, body) {
                      if (error) {
                        return res.json({
                          error: error,
                        });
                      } else {
                        return res.json({
                          message: "Mail sent! ",
                        });
                      }
                    });
                  } else {
                    res.status(404).json({ message: "404 NOT FOUND" });
                  }
                })
                .catch((error) => {
                  console.log(error);
                  res.status(500).json({ error: error });
                });

            }
          }
        );
      } else {
        res.status(404).json({ message: "404 NOT FOUND" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
  User.findById(req.body.idReciver)
    .exec()
    .then((doc) => {
      if (doc) {
        console.log(doc);
        User.updateOne(
          { _id: req.body.idReciver },
          {
            $set: { balance: doc.balance + amount },
            $addToSet: {
              transaction: [
                {
                  typeTransaction: "Reciving",
                  secondUser: req.body.idSender,
                  date: Date.now(),
                  amount: amount,
                },
              ],
            },
          },
          function (err, result) {
            if (err) {
              res.send(err);
              console.log(err);
            } else {
              User.findById(req.body.idSender)
                .exec()
                .then((resultDoc) => {
                  if (resultDoc) {
                    const data = {
                      from: "Tuncoin Team <no-reply@tuncoin.tn>",
                      to: doc.email,
                      subject: "Transaction Successfully Completed",
                      html: `<h2> You have recived ${amount} TNC from ${resultDoc.email} </h2>              `,
                    };
                    mg.messages().send(data, function (error, body) {
                      if (error) {
                        return res.json({
                          error: error,
                        });
                      } else {
                        return res.json({
                          message: "Mail sent! ",
                        });
                      }
                    });
                  } else {
                    res.status(404).json({ message: "404 NOT FOUND" });
                  }
                })
                .catch((error) => {
                  console.log(error);
                  res.status(500).json({ error: error });
                });
            }
          }
        );
      } else {
        res.status(404).json({ message: "404 NOT FOUND" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
};
/* BUY COIN*/
exports.buy = (req, res, next) => {
  const amount = parseFloat(req.body.amount);
  User.findById(req.body.id)
    .exec()
    .then((doc) => {
      if (doc) {
        console.log(doc);
        User.updateOne(
          { _id: req.body.id },
          {
            $set: { balance: doc.balance + amount },
            $addToSet: {
              transaction: [
                {
                  typeTransaction: "Buying",
                  date: Date.now(),
                  amount: amount,
                },
              ],
            },
          },
          function (err, result) {
            if (err) {
              res.send(err);
              console.log(err);
            } else {
              const data = {
                from: "Tuncoin Team <no-reply@tuncoin.tn>",
                to: doc.email,
                subject: "Transaction Successfully Completed",
                html: `<h2> You have bought ${amount} TNC</h2>  `,
              };
              mg.messages().send(data, function (error, body) {
                if (error) {
                  return res.json({
                    error: error,
                  });
                } else {
                  return res.json({
                    message: "Mail sent! ",
                  });
                }
              });
            }
          }
        );
      } else {
        res.status(404).json({ message: "404 NOT FOUND" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
};
