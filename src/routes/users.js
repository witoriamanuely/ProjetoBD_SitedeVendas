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
	"INSERT INTO projetobd.user(name, password, email, street, number, zip_code, neighborhood) VALUES($1, $2, $3, $4, $5, $6, $7)";
const insertPhone =
	"INSERT INTO projetobd.phone(mobile_phone, landline) VALUES($1, $2)";
const selectUserPhone = "SELECT * FROM projetobd.phone WHERE id=$1";

function returnMessages(res, req, errors, string, address_error, address_success) {
	var errors = errors;

	if (errors) {
		res.render(address_error, {
			errors: errors
		});

		return false;
	} else {
		req.flash("success_msg", string);

		res.redirect(address_success);

		return true;
	}
};

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

function genericInsertQuery(err, client, done, res, message, values) {
	client.query(message, values, function (err, result) {
		done();
		if (err) {
			console.log(err);
			res.status(400).send(err);
		}
	});
};

function selectQuery(err, client, done, res, message, values, page) {
	client.query(message, values, function (err, result) {
		done();
		if (err) {
			console.log(err);
			res.status(400).send(err);
		}

		res.render(page, {
			phone: result.rows
		});
	});
}

router.get("/account/info", loggedIn, function (req, res) {
	pool.connect(function (err, client, done) {
		if (err) {
			console.log("Não foi possivel fazer a conexão" + err);
			res.status(400).send(err);
		}
		selectQuery(err, client, done, res, selectUserPhone,  [res.locals.user.id_phone], 'info');
	});
});

router.get("/account/order", loggedIn, function (req, res) {
	res.render("order");
});

router.get("/logout", function (req, res) {
	req.logout();

	req.flash("success_msg", "Você não está mais logado");

	res.redirect("/users/login");
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

	result = returnMessages(res, req, req.validationErrors(), "Você está registrado e pode fazer o login", "register", "/users/login");

	if (result) {
		pool.connect(function (err, client, done) {
			if (err) {
				console.log("Não foi possivel fazer a conexão" + err);
				res.status(400).send(err);
			}
			genericInsertQuery(err, client, done, res, insertPhone, valuesUserPhone);
			genericInsertQuery(err, client, done, res, insertUserTable, valuesUser);
		});
	}
});

router.post("/account/info/update_info", loggedIn, function (req, res) {
	result = returnMessages(res, req, req.validationErrors(), "Informações alteradas com sucesso", "info", "/users/account/info");

	if (result) {
		pool.connect(function (err, client, done) {
			if (err) {
				console.log("Não foi possivel fazer a conexão" + err);
				res.status(400).send(err);
			}
			genericInsertQuery(err, client, done, res, insertPhone, valuesUserPhone);
			genericInsertQuery(err, client, done, res, insertUserTable, valuesUser);
		});
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

	returnMessages(res, req, req.validationErrors(), "Senha alterada com sucesso", "info", "/users/account/info");
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