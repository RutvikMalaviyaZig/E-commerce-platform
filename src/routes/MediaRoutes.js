const express = require('express');

// Routes
const router = express.Router();

//multer configuration
const upload = require('../../config/multer');

// Controllers
const MediaController = require('../controllers/MediaController');

// Routes for controllers
router.post('/upload', upload.array('file', 12), MediaController.upload);
router.post('/delete', MediaController.delete);

// Export routes
module.exports = router;
