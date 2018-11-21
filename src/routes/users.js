const express = require('express');
const router = express.Router();
const passport = require('passport');
const pg = require('pg');
const LocalStrategy = require('passport-local').Strategy;

function returnMessages(res, req, errors, string, address_error, address_success) {
    var errors = errors;

    if (errors) {
        res.render(address_error, {
            errors: errors
        });
    } else {
        req.flash('success_msg', string);

        res.redirect(address_success);
    }
}

router.get('/login', function (req, res) {
    res.render('login')
});

router.get('/register', function (req, res) {
    res.render('register')
});

router.get('/account/info', function (req, res) {
    res.render('info')
});

router.get('/account/order', function (req, res) {
    res.render('order')
});

router.get('/logout', function (req, res) {
    req.logout();
    
    req.flash('success_msg', 'Você não está mais logado');
    
    res.redirect('/users/login');
});

router.post('/register', function (req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var neighborhood = req.body.neighborhood;
    var zipCode = req.body.zipCode;
    var street = req.body.street;
    var phone1 = req.body.phone1;
    var phone2 = req.body.phone2;
    var password1 = req.body.password1;
    var password2 = req.body.password2;

    req.checkBody('password1', 'A senha deve ter no minimo 8 digitos e no máximo 24').isLength({
        min: 8,
        max: 24
    });
    req.checkBody('password2', 'As senhas digitadas não são iguais').equals(password1);

    returnMessages(res, req, req.validationErrors(), 'Você está registrado e pode fazer o login', 'register', '/users/login');
});

router.post('/account/info', function (req, res) {
    var password1 = req.body.password1;
    var password2 = req.body.password2;

    req.checkBody('password1', 'A senha deve ter no minimo 8 digitos e no máximo 24').isLength({
        min: 8,
        max: 24
    });
    req.checkBody('password2', 'As senhas digitadas não são iguais').equals(password1);

    returnMessages(res, req, req.validationErrors(), 'Senha alterada com sucesso', 'info', '/users/account/info');
});

passport.use(new LocalStrategy(
    function (username, password, done) {

    }
));

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/');
    });

module.exports = router;