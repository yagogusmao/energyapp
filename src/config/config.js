var config = {};

const mongoose = require('mongoose');

const database = 'mongodb://admin:admin123@ds157735.mlab.com:57735/energy-ltda'

mongoose.connect(database,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('useCreateIndex', true)

module.exports = config;