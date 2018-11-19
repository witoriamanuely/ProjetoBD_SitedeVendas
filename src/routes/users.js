const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

router.get('/login', function (req, res) {
    res.render('login')
});

router.get('/register', function (req, res) {
    res.render('register')
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

    req.checkBody('password1', 'A senha deve ter no minimo 8 digitos e no máximo 20').isLength({
        min: 8,
        max: 20
    });
    req.checkBody('password2', 'As senhas digitadas não são iguais').equals(password1);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        user

        req.flash('success_msg', 'Você está registrado e pode fazer o login');

        res.redirect('login');
    }
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