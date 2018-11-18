const express = require('express')
const app = express()
const bodyParser = require ('body-parser'); 


app.set ('view engine', 'ejs')
app.use (express.static('public'));

app.use (bodyParser.urlencoded ({extended: true}));

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/login', function (req, res) {
  res.render('login')
})

app.get('/cadastro', function (req, res) {
  res.render('cadastro')
})

app.get('/produtos', function (req, res) {
  res.render('produtos')
})

app.post('/cadastro', function (req, res) {
  /*let primeiroNome = req.body.primeiroNome;
  let sobrenome = req.body.sobrenome;
  let email = req.body.email;
  let bairro = req.body.bairro;
  let cep = req.body.cep;
  let tel1 = req.body.telefone1;
  let tel2 = req.body.telefone2;
  let password = req.body.password;
  res.render('cadastro');*/
})

app.post('/login', function (req, res) {
  console.log(req.body.email);
  console.log(req.body.password);
  res.render('login');
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
