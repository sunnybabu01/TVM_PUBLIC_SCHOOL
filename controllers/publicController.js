const Event = require('../models/Event');
const Teacher = require('../models/Teacher');
const Notification = require('../models/Notification');
const Topper = require('../models/Topper');

/**
 * Render Public Home Page
 */
const getHome = async (req, res, next) => {
  try {
    const featuredEvents = await Event.find({ isFeatured: true }).sort({ eventDate: -1 }).limit(3);
    const announcements = await Notification.find({ targetRole: 'all' }).sort({ createdAt: -1 }).limit(5);
    const toppers = await Topper.find({ isFeatured: true }).sort({ createdAt: -1 });
    
    res.render('public/index', {
      title: 'TVM Public School, Patna',
      featuredEvents,
      announcements,
      toppers,
      user: req.session ? req.session.user : null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render About School Page
 */
const getAbout = (req, res) => {
  res.render('public/about', {
    title: 'About Us | TVM Public School',
    user: req.session ? req.session.user : null
  });
};

/**
 * Render School Gallery Page
 */
const getGallery = async (req, res, next) => {
  try {
    const galleryItems = await Event.find({ category: 'Gallery Only' }).sort({ eventDate: -1 });
    res.render('public/gallery', {
      title: 'Photo Gallery | TVM Public School',
      galleryItems,
      user: req.session ? req.session.user : null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render Contact Us Page
 */
const getContact = (req, res) => {
  res.render('public/contact', {
    title: 'Contact Us | TVM Public School',
    user: req.session ? req.session.user : null
  });
};

/**
 * Render Facilities Page
 */
const getFacilities = (req, res) => {
  res.render('public/facilities', {
    title: 'School Facilities | TVM Public School',
    user: req.session ? req.session.user : null
  });
};

/**
 * Render Faculty/Staff List Page
 */
const getFaculty = async (req, res, next) => {
  try {
    const teachers = await Teacher.find({}, 'name subject photo email');
    res.render('public/faculty', {
      title: 'Our Faculty | TVM Public School',
      teachers,
      user: req.session ? req.session.user : null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render Events & News Page
 */
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ category: { $ne: 'Gallery Only' } }).sort({ eventDate: -1 });
    res.render('public/events', {
      title: 'Events & Announcements | TVM Public School',
      events,
      user: req.session ? req.session.user : null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHome,
  getAbout,
  getGallery,
  getContact,
  getFacilities,
  getFaculty,
  getEvents
};
