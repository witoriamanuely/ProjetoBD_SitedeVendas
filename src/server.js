


const express = require('express');
const app = express();
const bodyParser = require ('body-parser'); 
const pg = require('pg');
const connectionString = 'postgres://bluebird:bluebird@localhost/bluebird';
 
app.get('/', function (req, res, next) {
    pg.connect(connectionString,function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query('SELECT * FROM get', [1],function(err,result) {
           done(); // closing the connection;
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.status(200).send(result.rows);
       });
    });
});
 

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


app.post('/login', function (req, res) {
  res.render('login');
})

app.post('/cadastro', function(req, res){
res.render('cadastro');
}
  
)




app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
