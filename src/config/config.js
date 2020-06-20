  
var config = {};

const mongoose = require('mongoose');
require('dotenv').config();

const banco = process.env.BANCOTESTE;

mongoose.connect(banco,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('useCreateIndex', true)

module.exports = config;