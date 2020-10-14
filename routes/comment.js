'use strict'

var express = require('express');
var CommentController = require('../controllers/comment');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

// Rutas de topics
router.post('/comment/topic/:topicId', md_auth.authenticated, CommentController.add);
router.put('/comment/:commentId', md_auth.authenticated, CommentController.update);
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, CommentController.delete);

module.exports = router;