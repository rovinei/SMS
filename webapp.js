var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var morgan = require('morgan');
var csurf = require('csurf');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var config = require('./config');


// Create Express web app
var app = express();

// Set ejs template engine
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

// Use morgan for HTTP request logging in dev and prod
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Use cookieParser for handle cookie
app.use(cookieParser());

// Use session for handle session request
app.use(session(
  {
    secret:config.secret,
    key:'session_cookie',
    saveUninitialized: false,
    resave: true
  }
));

// Use bodyParser for handle render request params
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


// Use cors for handle CSRF & XSRF
var corsOptions = {
  allowedHeaders: 'X-Requested-With, content-type, Authorization, X-API-KEY, X-XSRF-TOKEN'
};
app.use(cors(corsOptions));

// Add CSRF protection for web routes
if (process.env.NODE_ENV !== 'test') {
  app.use(csurf({'cookie': true}));
  app.use(function(request, response, next) {
    var token = request.csrfToken();
    response.cookie('XSRF-TOKEN', token);
    response.locals.csrfToken = token;
    next();
  });
}

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Use connect-flash to persist informational messages across redirects
app.use(flash());

// Configure application routes
var routes = require('./routes/router');
var router = express.Router();
routes(router);
app.use(router);

// Handle 404
app.use(function(request, response, next) {
  response.status(404);
  response.sendFile(path.join(__dirname, 'public', '404.html'));
});

// Handle Server Errors
app.use(function(err, request, response, next) {
  console.error('An application error has occurred:');
  console.error(err.stack);
  response.status(500);
  response.sendFile(path.join(__dirname, 'public', '500.html'));
});


// Export Express app
module.exports = app;
