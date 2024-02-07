// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/get-otp', (req, res) => {
  const enteredMobileNumber = req.body.mobileNumber;

   // Generate OTP
   const generatedOTP = '123456'; // For simplicity

  // Store mobile number and OTP in the database
  const sql = 'INSERT INTO users (mobile_number, otp) VALUES (?, ?)';
  db.query(sql, [enteredMobileNumber, generatedOTP], (err, result) => {
  if (err) {
    console.error('Error storing mobile number and OTP:', err);
    res.render('login', { error: 'An error occurred. Please try again.' });
  } else {
    req.session.mobileNumber = enteredMobileNumber;
    res.render('otp');
  }
});

});

router.post('/verify-otp', (req, res) => {
  const enteredOTP = req.body.otp;
  const enteredMobileNumber = req.session.mobileNumber;

  // Check if the provided OTP is valid
  const sql = 'SELECT * FROM users WHERE mobile_number = ? AND otp = ?';
  db.query(sql, [enteredMobileNumber, enteredOTP], (err, result) => {
    if (err) {
      console.error('Error verifying OTP:', err);
      res.render('otp', { error: 'An error occurred. Please try again.' });
    } else if (result.length > 0) {
      // Valid OTP, user is authenticated
      req.session.isAuthenticated = true;
      req.session.username = 'shiv'; // Set username to 'shiv'
      res.redirect('/dashboard');
    } else {
      res.render('otp', { error: 'Invalid OTP. Please try again.' });
    }
  });
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
