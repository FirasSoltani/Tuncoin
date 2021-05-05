/***** GLOBAL IMPORTS *****/
const mongoose = require('mongoose');

/***** CREATE YOUR ENTITY HERE *****/
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, require: true, unique: true, lowercase: true },
    password: { type: String, require: true },
   // phone: { type: Number, require: true, unique: true },
   address:{ type: String, require: true, unique: true},
    balance : { type: Number, default: parseFloat(0)},
    isConfimed: {type : Boolean, default: false},
    resetCode: { data: String, default: ''},
    transaction: [{
        date: Date,
        typeTransaction: {type : String, enum: ['Buying', 'Sending', 'Buying']},
        secondUser: String,
        amount: Number,
    }],
});

module.exports = mongoose.model('User', userSchema);