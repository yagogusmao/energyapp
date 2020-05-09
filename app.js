var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var app = express();

const corsOptions = {
  origin: '*',
  methods: [
    'GET',
    'PUT',
    'POST',
    'DELETE'
  ],
  allowedHeaders: [
    'Content-Type',
  ]
}

app.use(cors(corsOptions));

const port = process.env.PORT || 8080;
const config = require('./src/config/config');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const ApontamentoController = require('./src/controllers/ApontamentoController');
app.use('/apontamento', ApontamentoController)
const AtividadeController = require('./src/controllers/AtividadeController');
app.use('/atividade', AtividadeController)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, function () {
  console.log("App is running on port " + port);
});

module.exports = app;
