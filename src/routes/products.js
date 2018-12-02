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

const selectProducts = "SELECT * FROM projetobd.product";

router.get('/products', function (req, res) {
	pool.connect(function(err, client, done) {
		if (err) {
			console.log("Não foi possivel fazer a conexão" + err);
			res.status(400).send(err);
		}
		selectQuery(err, client, done, res, selectProducts, 'products');
	});
});

function selectQuery(err, client, done, res, message, page) {
	client.query(message, function(err, result) {
		done();
		if (err) {
			console.log(err);
			res.status(400).send(err);
		}
		res.render(page, {products: result.rows});
	});
}

router.get('/cart', function (req, res) {
	res.render('cart');
});

router.get('/checkout', function (req, res) {
	res.render('checkout');
});

module.exports = router;