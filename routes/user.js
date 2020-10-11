'use sttrict'

var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();

router.get('/probando', UserController.probando);
router.post('/testeando', UserController.testeando);

module.exports = router;