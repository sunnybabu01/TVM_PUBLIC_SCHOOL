const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.getHome);
router.get('/about', publicController.getAbout);
router.get('/gallery', publicController.getGallery);
router.get('/contact', publicController.getContact);
router.get('/facilities', publicController.getFacilities);
router.get('/faculty', publicController.getFaculty);
router.get('/events', publicController.getEvents);

module.exports = router;
