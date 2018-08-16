var express = require('express');
var path = require('path');
var cors = require('cors');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var app = express();
const router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var login_register = require('./routes/login_register');
var room = require('./routes/quest');

const swaggerJSDoc = require('swagger-jsdoc')
// Swagger definition
// You can set every attribute except paths and swagger
// https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md
var swaggerDefinition = {
    info: { // API informations (required)
        title: '부릉부릉 - 사필귀정', // Title (required)
        version: '1.0.0', // Version (required)
        description: 'API Document', // Description (optional)
    },
    host: '13.124.86.54:23002', // Host (optional)
    basePath: '/apidoc', // Base path (optional)
    securityDefinitions: {
        jwt: {
            type: 'apiKey',
            name: 'x-access-token',
            in: 'header'
        }
    },
    security: [
        { jwt: [] }
    ]
}

// Options for the swagger docs
var options = {
    // Import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // Path to the API docs
    apis: [
        './routes/login_register.js',
        './routes/quest.js'
    ],
}

// Initialize swagger-jsdoc -> returns validated swagger spec in json format

const swaggerUi = require('swagger-ui-express');
var swaggerSpec = swaggerJSDoc(options)

app.use('/apidoc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/api/v1g1/user', login_register);
app.use('/api/v1g1/room', room);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
console.log('hi');



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var SocketIo = require('socket.io');
const socketEvent = require('./functions/chat');
var io = SocketIo();
app.io = io;
socketEvent.sockets(io);

module.exports = app;
