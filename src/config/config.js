  
var config = {};

const mongoose = require('mongoose');
require('dotenv').config();
const database = process.env.DATABASE;

mongoose.connect(database,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('useCreateIndex', true)

module.exports = config;