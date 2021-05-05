/***** GLOBAL IMPORTS *****/
const { hash } = require("bcrypt");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailgun = require("mailgun-js");
const firebaseAdmin = require("firebase-admin");

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
/* NEW TRANSACTION */
exports.transaction = (req, res, next) => {
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
