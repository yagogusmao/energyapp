  
var config = {};

const mongoose = require('mongoose');
require('dotenv').config();

//const database = process.env.DATABASE;

config = {
    banco: 'mongodb://admin:admin123@ds157735.mlab.com:57735/energy-ltda',
    salt_rounds: 13,
    secret: '05e7d19a6d002118deef70d21ff4226e'
}

mongoose.connect(config.banco,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('useCreateIndex', true)

module.exports = config;