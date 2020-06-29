var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var app = express();

app.use(cors());

app.all('/*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const port = process.env.PORT || 8080;
require('./src/config/config');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const Autenticador = require('./src/middlewares/Autenticador');

const ApontamentoController = require('./src/controllers/ApontamentoController');
app.use('/apontamento', Autenticador, ApontamentoController);
const AtividadeController = require('./src/controllers/AtividadeController');
app.use('/atividade', Autenticador, AtividadeController);
const FuncionarioController = require('./src/controllers/FuncionarioController');
app.use('/funcionario', Autenticador, FuncionarioController);
const VeiculoController = require('./src/controllers/VeiculoController');
app.use('/veiculo', Autenticador, VeiculoController);
const EquipeController = require('./src/controllers/EquipeController');
app.use('/equipe', Autenticador, EquipeController);
const AlmoxarifadoController = require('./src/controllers/AlmoxarifadoController');
app.use('/almoxarifado', Autenticador, AlmoxarifadoController);
const MaterialController = require('./src/controllers/MaterialController');
app.use('/material', Autenticador, MaterialController);
const UsuarioController = require('./src/controllers/UsuarioController');
app.use('/usuario', UsuarioController);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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
