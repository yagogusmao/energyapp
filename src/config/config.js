  
var config = {};

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.BANCO,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('useCreateIndex', true)

module.exports = config;