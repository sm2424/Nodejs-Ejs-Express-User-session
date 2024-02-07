// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/get-otp', (req, res) => {
  const enteredMobileNumber = req.body.mobileNumber;

  // Validate if the provided mobile number has exactly 10 digits and is '1234567890'
  if (enteredMobileNumber === '1234567890') {
    // Valid mobile number, generate and send OTP (skipping for simplicity)
    req.session.mobileNumber = enteredMobileNumber;
    res.render('otp');
  } else {
    res.render('login', { error: 'Invalid mobile number. Please enter the correct mobile number (1234567890).' });
  }
});

router.post('/verify-otp', (req, res) => {
  const enteredOTP = req.body.otp;

  // Check if the provided OTP is valid
  if (enteredOTP === '123456') {
    // Valid OTP, user is authenticated
    req.session.isAuthenticated = true;
    req.session.username = 'shiv'; // Set username to 'shiv'
    res.redirect('/dashboard');
  } else {
    res.render('otp', { error: 'Invalid OTP. Please try again.' });
  }
});

router.get('/dashboard', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobileNumber= req.session.mobileNumber;
    res.render('dashboard', { username: req.session.username, mobileNumber: mobileNumber });
  } else {
    res.redirect('/');
  }
});

router.get('/aboutus', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobileNumber= req.session.mobileNumber;
    res.render('aboutus', { username: req.session.username, mobileNumber: mobileNumber });
  } else {
    res.redirect('/');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    } else {
      res.redirect('/');
    }
  });
});


module.exports = router;
