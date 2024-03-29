require('./utils/create_admin_user');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var apiRoutes = require('./routes/api');
var app = express();
const cors = require('cors'); 
const TareaProgramada = require('./cron-job/tarea-programada');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(express.json());
app.use(cors({
  origin:[
    'https://pagoservicios.tecnosoft.xyz',
    'http://localhost:4200',
    'https://veripagos.com',
    'http://localhost:5500',
  ] , // Permitir solicitudes desde tu aplicación Angular
  credentials: true // Si estás manejando cookies u otras credenciales
}));
app.use('/', indexRouter);
app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

let tareaProgramadas = new TareaProgramada();
module.exports = app;
