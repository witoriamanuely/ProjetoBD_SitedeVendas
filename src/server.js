const express = require('express');
const bodyParser = require('body-parser');
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
var cart = require('./cart');

const app = express();

const config = {
	user: "bluebird",
	database: "bluebird",
	password: "bluebird",
	port: 5432
};

const pool = new pg.Pool(config);

pool.on('error', function (err) {
	console.log('idle client error', err.message, err.stack);
});

const postgresLocal = require('./db/index')(pool);

passport.use(new LocalStrategy({
		usernameField: "email",
		passwordField: "password"
	},
	postgresLocal.localStrategy));
passport.serializeUser(postgresLocal.serializeUser);
passport.deserializeUser(postgresLocal.deserializeUser);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(expressSession({
	secret: 'secret',
	saveUninitialized: true,
	resave: true,
	cookie: { maxAge : 3600000 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
	errorFormatter: function (param, msg, value) {
		var namespace = param.split('.'),
			root = namespace.shift(),
			formParam = root;

		while (namespace.length) {
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

app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	res.locals.cart = cart;
	next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/products', products);

app.listen(3000, function () {
	console.log('Example app listening on port 3000!')
});