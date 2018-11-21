const express = require('express');
const router = express.Router();
const pg = require('pg');

const config = {
    user: 'bluebird',
    database: 'bluebird',
    password: 'bluebird',
    port: 5432
};

const pool = new pg.Pool(config);

router.get('/products', function (req, res) {
    /*
    pool.connect(function(err, client, done) {
        if (err) {
          return console.error('error fetching client from pool', err);
        }

        client.query('SELECT * FROM projetobd.product', function(err, result) {
          done();
          if (err) {
            return console.error('error running query', err);
          }
          res.render('products', {products: result.rows});
          done();
        });
      
      });
    */
   res.render('products');
});

module.exports = router;