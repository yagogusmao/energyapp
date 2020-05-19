  
var config = {};

const mongoose = require('mongoose');
require('dotenv').config();
const database = process.env.database;

mongoose.connect(database,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('useCreateIndex', true)

module.exports = config;