const express = require("express");
const router = express.Router();
const passport = require("passport"),
	LocalStrategy = require("passport-local").Strategy;
const pg = require("pg");

const config = {
	user: "bluebird",
	database: "bluebird",
	password: "bluebird",
	port: 5432
};

const pool = new pg.Pool(config);

const insertUserTable =
	"INSERT INTO projetobd.user(name, password, email, street, number, zip_code, neighborhood, id_phone) VALUES($1, $2, $3, $4, $5, $6, $7, $8)";
const insertPhone =
	"INSERT INTO projetobd.phone(mobile_phone, landline) VALUES($1, $2) RETURNING id";
const selectUserPhone = "SELECT * FROM projetobd.phone WHERE id=$1";
const updateUserTable =
	'UPDATE projetobd.user SET name=$1, email=$2, street=$3, number=$4, zip_code=$5, neighborhood=$6 WHERE id=$7';
const updateUserPassword =
	'UPDATE projetobd.user SET password=$1 WHERE id=$2';
const updatePhone = 'UPDATE projetobd.phone SET mobile_phone=$1, landline=$2 WHERE id=$3';
const selectOrders = 'SELECT * FROM projetobd.order WHERE id_user=$1';

function checkForErrors(res, errors, address_error) {
	var errors = errors;

	if (errors) {
		if(address_error === "info") {
			pool.query(selectUserPhone, [res.locals.user.id_phone], function (err, result) {
				if (err) {
					console.log(err);
					res.status(400).send(err);
				}
		
				res.render(address_error, {
					errors: errors,
					phone: result.rows
				});
			});
		} else {
			res.render(address_error, {
				errors: errors
			});
		}

		return false;
	} else {
		return true;
	}
};

function successRedirect(res, req, string, address_success) {
	req.flash("success_msg", string);

	res.redirect(address_success);
}

router.get("/login", function (req, res) {
	res.render("login");
});

router.get("/register", function (req, res) {
	res.render("register");
});

function loggedIn(req, res, next) {
	if (req.user) {
		next();
	} else {
		req.flash("error_msg", "Você precisa estar logado para acessar essa pagina");
		res.redirect("/users/login");
	}
}

router.get("/account/info", loggedIn, function (req, res) {
	pool.query(selectUserPhone, [res.locals.user.id_phone], function (err, result) {
		if (err) {
			console.log(err);
			res.status(400).send(err);
		}

		res.render('info', {
			phone: result.rows
		});
	});
});

router.get("/account/order", loggedIn, function (req, res) {
	pool.connect(function(err, client, done) {
		if (err) {
			console.log("Não foi possivel fazer a conexão" + err);
			res.status(400).send(err);
		}
		client.query(selectOrders, [res.locals.user.id], function(err, result) {
			done();
			if (err) {
				console.log(err);
				res.status(400).send(err);
			}
			res.render("order", {orders: result.rows});
		});
	});
});

router.get("/logout", function (req, res) {
	req.logout();

	successRedirect(res, req, "Você não está mais logado", "/users/login");
});

router.post("/register", function (req, res) {
	var name = req.body.firstName + " " + req.body.lastName;

	const valuesUser = [
		name,
		req.body.password1,
		req.body.email,
		req.body.street,
		req.body.houseNumber,
		req.body.zipCode,
		req.body.neighborhood
	];

	const valuesUserPhone = [
		req.body.phone1,
		req.body.phone2
	];

	var password1 = req.body.password1;
	var password2 = req.body.password2;

	req.checkBody("password1", "A senha deve ter no minimo 8 digitos e no máximo 24").isLength({
		min: 8,
		max: 24
	});
	req.checkBody("password2", "As senhas digitadas não são iguais").equals(password1);

	result = checkForErrors(res, req.validationErrors(), "register");

	if (result) {
		(async () => {
			const client = await pool.connect();

			try {
				await client.query('BEGIN');
				const { rows } = await client.query(insertPhone, valuesUserPhone);
				valuesUser.push(rows[0].id);
				await client.query(insertUserTable, valuesUser);
				await client.query('COMMIT');
			} catch (e) {
				await client.query('ROLLBACK');
				throw e;
			} finally {
				client.release();
			}
		})().catch(e => console.error(e.stack));

		successRedirect(res, req, "Você está registrado e pode fazer o login", "/users/login");
	}
});

router.post("/account/info/update_info", loggedIn, function (req, res) {
	var name = req.body.firstName + " " + req.body.lastName;

	const valuesUser = [
		name,
		req.body.email,
		req.body.street,
		req.body.houseNumber,
		req.body.zipCode,
		req.body.neighborhood,
		res.locals.user.id
	];

	const valuesUserPhone = [
		req.body.phone1,
		req.body.phone2,
		res.locals.user.id_phone
	];

	result = checkForErrors(res, req.validationErrors(), "info");

	if (result) {
		(async () => {
			const client = await pool.connect();

			try {
				await client.query('BEGIN');
				await client.query(updatePhone, valuesUserPhone);
				await client.query(updateUserTable, valuesUser);
				await client.query('COMMIT');
			} catch (e) {
				await client.query('ROLLBACK');
				throw e;
			} finally {
				client.release();
			}
		})().catch(e => console.error(e.stack));

		successRedirect(res, req, "Informações alteradas com sucesso", "/users/account/info");
	}
});

router.post("/account/info/update_password", loggedIn, function (req, res) {
	var password1 = req.body.password1;
	var password2 = req.body.password2;

	req.checkBody("password1", "A senha deve ter no minimo 8 digitos e no máximo 24").isLength({
		min: 8,
		max: 24
	});

	req.checkBody("password2", "As senhas digitadas não são iguais").equals(password1);

	result = checkForErrors(res, req.validationErrors(), "info");

	if (result) {
		(async () => {
			const client = await pool.connect();

			try {
				await client.query('BEGIN');
				await client.query(updateUserPassword, [password1, res.locals.user.id]);
				await client.query('COMMIT');
			} catch (e) {
				await client.query('ROLLBACK');
				throw e;
			} finally {
				client.release();
			}
		})().catch(e => console.error(e.stack));

		successRedirect(res, req, "Senha alterada com sucesso", "/users/account/info");
	}
});

router.post("/login",
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/users/login",
		failureFlash: "Email ou senha inválida"
	}),
	function (req, res) {
		res.redirect("/");
	}
);

module.exports = router;