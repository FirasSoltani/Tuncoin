/***** GLOBAL IMPORTS *****/
const { hash } = require("bcrypt");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailgun = require("mailgun-js");
const method = require("./blockchain");
/*const Web3 = require("web3");
const Tuncoin = require("../build/contracts/Tuncoin.json");
const ethWallet = require("ethereumjs-wallet");*/

/***** MAILGUN SETTINGS *****/
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

/***** MODELS IMPORT *****/
const User = require("../models/user");

/***** FUNCTIONS GOES HERE *****/
/* REGISTER */
exports.signup = (req, res, next) => {
  User.find({ email: req.body.email }).exec().then((user) => {
    if (user >= 1) {
      return res.status(401).json({ message: "Account Exists" });
    } else {
      console.log("jawek behi");

      method.blockchainMethods.start();
      Promise.resolve(method.blockchainMethods.createAccount()).then((account) => {
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          address: account.address,
        });
        user.save().then((result) => {
          // SEND PRIVATE KEY VIA MAIL !!!
          const data = {
            from: "Tuncoin Team <no-reply@tuncoin.tn>",
            to: req.body.email,
            subject: "Account Key",
            html: `<h2> Please Save your private key </h2>
                <p> PrivateKey: ${account.privateKey}</p>`,
          };
          mg.messages().send(data, function (error, body) {
            if (error) {
              return res.json({
                error: error,
                message: "Credentials MailGun ERROR"
              });
            } else {
              return res.status(200).json({
                message: "Mail sent! ",
                user: result,
              });
            }
          });
        });
      });
    }
  });

};
/*exports.signup = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user >= 1) {
        return res.status(401).json({ message: "Mail Exists" });
      } else {
        bcrypt.hash(req.body.password, 10, (error, hash) => {
          if (error) {
            return res.status(500).json({ error: error });
          } else {
            method.blockchainMethods.start();
  Promise.resolve(method.blockchainMethods.createAccount()).then((newAddress) => {console.log("aaaa: " + newAddress)

            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
               address: newAddress,
              //  privateKey: EthWallet.getPrivateKeyString(),  ////// Must send it in mail
            });
            const token = jwt.sign(
              {
                email: user.email,
                password: user.password,
              },
              process.env.JWT_KEY,
              { expiresIn: "30m" }
            );
            user
              .save()
              .then((result) => {
                // SEND ACTIVATION MAIL !!!
                const data = {
                  from: "Tuncoin Team <no-reply@tuncoin.tn>",
                  to: req.body.email,
                  subject: "Account Activation",
                  html: `<h2> Please click on given button to activate you account </h2>
                        <a href=" ${process.env.BASE_URL}/activation/${token}" > Verify your account</a>`,
                };
                mg.messages().send(data, function (error, body) {
                  if (error) {
                    return res.json({
                      error: error,
                    });
                  } else {
                    return res.status(200).json({
                      message: "Mail sent! ",
                      token: token,
                      user: result,
                    });
                  }
                });
              })
              .catch((error) => {
                return res
                  .status(401)
                  .json({ message: "Mail exists!", error: error });
              });
          });}
        });
      }
    });
}; */

/* LOGIN */
exports.login = (req, res, next) => {

};

/* IMPORT WALLET */
exports.importWallet = (req, res, next) => {
  const privateKey = req.body.privateKey
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      try{
      if (user <= 1) {
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          address: account.address,
        });
      }}catch{
        console.log("Error in importing wallet");
      }
      return res.status(200).json({ message: "Login" });
    });
};

/*exports.login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      console.log(req.body);
      if (user.length < 1) {
        return res.status(401).json({ message: "Mail not found" });
      } else {
        bcrypt.compare(req.body.password, user[0].password, (error, result) => {
          if (error) {
            return res.status(401).json({
              error: error,
            });
          }
          if (result) {
            if (user[0].isConfimed) {
              console.log("this is a user" + user);
              return res.status(200).json({
                user: user[0],
              });
            } else {
              res.status(401).json({
                message: "Account is not activated!",
              });
            }
          } else {
            res.status(401).json({
              message: "Password does not match!",
            });
          }
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "None",
        error: error,
      });
    });
}; */

/* UPDATE PASSWORD */
/*exports.updatePassword = (req, res, next) => {
  const id = req.body.id;
  const password = req.body.password;
  bcrypt.hash(password, 10, (error, hash) => {
    if (error) {
      return res.status(500).json({ error: error });
    } else {
      User.findOneAndUpdate(
        { _id: id },
        { $set: { password: hash } },
        function (err, result) {
          if (err) {
            res.send(err);
          } else {
            res.send(result);
          }
        }
      );
    }
  });
};*/
/* FORGET PASSWORD */
/*exports.forgotPassword = (req, res, next) => {
  User.findOne({ email: req.body.email }).exec((error, user) => {
    if (error || !user) {
      return res
        .status(400)
        .json({ error: error, message: "User doesn't exist" });
    } else {
      const token = jwt.sign(
        {
          email: req.body.email,
        },
        process.env.JWT_KEY,
        { expiresIn: "6h" }
      );
      const data = {
        from: "Tuncoin Team <no-reply@tuncoin.tn>",
        to: req.body.email,
        subject: "Password Recovery",
        html: `<h2> This is your code for reseting your password: ${token} </h2>`,
      };
      return user.updateOne({ resetCode: token }, function (error, result) {
        if (error) {
          return res.status(400).json({ error: error });
        } else {
          /*return res.status(200).json({message : "good ! "});*/
/*mg.messages().send(data, function (error, body) {
  if (error) {
    return res.json({
      error: error,
      message: "error sending mail",
    });
  } else {
    return res.status(200).json({
      message: "Mail sent! ",
    });
  }
});
}
});
}
});
}; */
/* RESET PASSWORD */
/*exports.resetPassword = (req, res, next) => {
  if (req.body.resetCode) {
    jwt.verify(req.body.resetCode, process.env.JWT_KEY, function (error, decodedToken) {
      if (error) {
        return res
          .status(401)
          .json({ error: error, message: "Incorrect token or expired" });
      } else {
      /*  User.findOne({ resetCode }, (error, user) => {
          if (error || !user) {
            return res
              .status(404)
              .json({ message: "user doesn't exist", error: error });
          }
          else{

          }
        });*/
/*  bcrypt.hash(req.body.password, 10, (error, hash) => {
    if (error) {
      return res.status(500).json({ error: error });
    } else {
      User.findOneAndUpdate(
        { resetCode: req.body.resetCode },
        { $set: { password: hash } },
        function (err, result) {
          if (err) {
            res.send(err);
          } else {
            res.status(200).send(result);
          }
        }
      );
    }
  });
}
});
} else {
return res.status(401).json({ message: "invalid token" });
}
};*/
/* ACTIVATE ACCOUNT */
/*exports.activateAccount = (req, res, next) => {
  const token = req.params.token;
  if (token) {
    jwt.verify(token, process.env.JWT_KEY, function (err, decodedToken) {
      if (err) {
        return res.status(400).json({
          error: "Incorrect or Expired link.",
        });
      }
      const { email, password } = decodedToken;
      User.findOneAndUpdate(
        { email: email },
        { $set: { isConfimed: true } },
        function (err, result) {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: "Account Activated!" });
          }
        }
      );
    });
  } else {
    return res.json({ error: "Something went wrong!" });
  }
};*/
/* DELETE ACCOUNT */
/*exports.deleteAcount = (req, res, next) => {
  const id = req.body.id;
  User.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
};*/
/* GET USER */
/*exports.getUser = (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ message: "404 NOT FOUND" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
};*/
