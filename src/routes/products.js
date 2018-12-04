const express = require('express');
const router = express.Router();
const pg = require('pg');
var cart = require('../cart');

var productsPageValue = "1";

const config = {
	user: 'bluebird',
	database: 'bluebird',
	password: 'bluebird',
	port: 5432
};

const pool = new pg.Pool(config);

const selectProducts = "SELECT * FROM projetobd.product";
const selectProductsPriceCres = "SELECT * FROM projetobd.product ORDER BY price ASC";
const selectProductsPriceDesc = "SELECT * FROM projetobd.product ORDER BY price DESC";
const selectProductsAlpha = "SELECT * FROM projetobd.product ORDER BY name ASC";
const updateProductTable =
	'UPDATE projetobd.product SET stock_quantity=$1 WHERE ID=$2';
const insertOrder =
	'INSERT INTO projetobd.order(data, id_user) VALUES($1, $2) RETURNING code'
const insertOrderProduct = 'INSERT INTO projetobd.order_product(order_quantity, id_product, id_order) VALUES ($1, $2, $3);'

function getDate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();

	if (dd < 10) {
		dd = '0' + dd
	}

	if (mm < 10) {
		mm = '0' + mm
	}

	today = dd + '/' + mm + '/' + yyyy;
	return today;
}

function selectQuery(err, client, done, res, message, page) {
	client.query(message, function (err, result) {
		done();
		if (err) {
			console.log(err);
			res.status(400).send(err);
		}
		res.render(page, {
			products: result.rows
		});
	});
}

function loggedIn(req, res, next) {
	if (req.user) {
		next();
	} else {
		req.flash("error_msg", "Você precisa estar logado para acessar essa pagina");

		res.redirect("/users/login");
	}
}

router.post('/change_order', function (req, res) { 
	productsPageValue = req.body.productsOptions;

	res.redirect('/products/products');
});

router.get('/products', function (req, res) {
	pool.connect(function (err, client, done) {
		if (err) {
			console.log("Não foi possivel fazer a conexão" + err);
			res.status(400).send(err);
		}
		if (productsPageValue === "1") {
			selectQuery(err, client, done, res, selectProducts, 'products');
		} else if (productsPageValue === "2") {
			selectQuery(err, client, done, res, selectProductsAlpha, 'products');
		} else if (productsPageValue === "3") {
			selectQuery(err, client, done, res, selectProductsPriceDesc, 'products');
		} else if (productsPageValue === "4") {
			selectQuery(err, client, done, res, selectProductsPriceCres, 'products');
		}
	});
});

router.post('/add', function (req, res) {
	cart.totalAmount++;
	cart.totalPrice += parseFloat(req.body.productPrice);

	if (cart.productsId[req.body.productId] == null) {
		cart.productsId[req.body.productId] = {
			name: req.body.productName,
			price: req.body.productPrice,
			img: req.body.productImg,
			total: req.body.productQuantity,
			quantity: 1
		};
	} else {
		cart.productsId[req.body.productId].quantity++;
	}

	res.redirect('/products/products');
});

router.get('/cart', function (req, res) {
	res.render('cart');
});

router.get('/checkout', loggedIn, function (req, res) {
	res.render('checkout');
});

router.get('/clear_cart', function (req, res) {
	cart.totalAmount = 0;
	cart.totalPrice = 0;
	cart.productsId = {};

	req.flash("success_msg", "Carrinho foi esvaziado");

	res.redirect('/products/cart');
});

router.get('/checkout_confirm', function (req, res) {
	(async () => {
		const client = await pool.connect();

		try {
			await client.query('BEGIN');
			const {
				rows
			} = await client.query(insertOrder, [getDate(), res.locals.user.id]);
			for (var key in cart.productsId) {
				if (cart.productsId.hasOwnProperty(key)) {
					await client.query(updateProductTable, [cart.productsId[key].total - cart.productsId[key].quantity, key]);
					await client.query(insertOrderProduct, [cart.productsId[key].quantity, key, rows[0].code]);
				}
			}
			await client.query('COMMIT');
		} catch (e) {
			await client.query('ROLLBACK');
			throw e;
		} finally {
			client.release();
			cart.totalAmount = 0;
			cart.totalPrice = 0;
			cart.productsId = {};
			res.redirect("/");
		}
	})().catch(e => console.error(e.stack));
});

module.exports = router;