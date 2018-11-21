const express = require('express');
const bodyParser = require ('body-parser'); 
const flash = require('connect-flash');
const expressSession = require('express-session');
const expressValidator = require('express-validator');
const passport = require('passport'); 
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const pg = require('pg');
 
var routes = require('./routes/index');
var users = require('./routes/users');
var products = require('./routes/products');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(expressSession({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
		,	root = namespace.shift()
		,	formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value 
		};
	}
}));

app.use(flash());

app.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/products', products);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});