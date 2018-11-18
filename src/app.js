var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

//View engine
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'templates'));

// Static Path
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/cadastro', function(req, res) {
    res.render('cadastro');
});

app.get('/produtos', function(req, res) {
    res.render('produtos');
});

app.listen(3000, function() {
    console.log('Server Started on Port 3000');
});
