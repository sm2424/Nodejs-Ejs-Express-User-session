// routes/index.js
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');


// Add body-parser middleware
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/get-otp', (req, res) => {
  const enteredmobile_number = req.body.mobile_number;

   // Generate OTP
   const generatedOTP = '123456'; // For simplicity

  // Store mobile number and OTP in the database
  const sql = 'INSERT INTO users (mobile_number, otp) VALUES (?, ?)';
  db.query(sql, [enteredmobile_number, generatedOTP], (err, result) => {
  if (err) {
    console.error('Error storing mobile number and OTP:', err);
    res.render('login', { error: 'An error occurred. Please try again.' });
  } else {
    req.session.mobile_number = enteredmobile_number;
    res.render('otp');
  }
});

});

router.post('/verify-otp', (req, res) => {
  const enteredOTP = req.body.otp;
  const enteredmobile_number = req.session.mobile_number;

  // Check if the provided OTP is valid
  const sql = 'SELECT * FROM users WHERE mobile_number = ? AND otp = ?';
  db.query(sql, [enteredmobile_number, enteredOTP], (err, result) => {
    if (err) {
      console.error('Error verifying OTP:', err);
      res.render('otp', { error: 'An error occurred. Please try again.' });
    } else if (result.length > 0) {
      // Valid OTP, user is authenticated
      req.session.isAuthenticated = true;
      
      res.redirect('/dashboard');
    } else {
      res.render('otp', { error: 'Invalid OTP. Please try again.' });
    }
  });
});


  

router.get('/dashboard', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number= req.session.mobile_number;
    res.render('dashboard', {  mobile_number: mobile_number });
  } else {
    res.redirect('/');
  }
});


router.get('/profile', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    res.render('profile', { mobile_number: mobile_number });
  } else {
    res.redirect('/');
  }
});



router.post('/save-profile', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const { name, phone_number_id, pat } = req.body;
    const mobile_number = req.session.mobile_number;

    // Update profile details in the database
    const sql = 'UPDATE users SET username = ?, phone_number_id = ?, pat = ? WHERE mobile_number = ?';
    db.query(sql, [name, phone_number_id, pat, mobile_number], (err, result) => {
      if (err) {
        console.error('Error updating profile:', err);
        res.render('error', { error: 'An error occurred while updating profile.' });
      } else {
        console.log('sucessful');
        res.redirect('/viewprofile'); // Redirect to view profile page after updating
      }
    });
  } else {
    res.redirect('/');
  }
});




// routes/index.js

router.get('/viewprofile', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;

    // Fetch user details from the database
    const sql = 'SELECT * FROM users WHERE mobile_number = ?';
    db.query(sql, [mobile_number], (err, result) => {
      if (err) {
        console.error('Error fetching user details:', err);
        res.render('error', { error: 'An error occurred while fetching user details.' });
      } else {
        if (result.length > 0) {
          const { username, phone_number_id, pat } = result[0];
          res.render('viewprofile', { mobile_number, username, phone_number_id, pat });
        } else {
          res.render('error', { error: 'User not found.' });
        }
      }
    });
  } else {
    res.redirect('/');
  }
});

router.get('/edit-profile', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;

    // Fetch user details from the database
    const sql = 'SELECT * FROM users WHERE mobile_number = ?';
    db.query(sql, [mobile_number], (err, result) => {
      if (err) {
        console.error('Error fetching user details:', err);
        res.render('error', { error: 'An error occurred while fetching user details.' });
      } else {
        if (result.length > 0) {
          const { username, phone_number_id, pat } = result[0];
          res.render('profile', { mobile_number, username, phone_number_id, pat }); // Make sure to pass username here
        } else {
          res.render('error', { error: 'User not found.' });
        }
      }
    });
  } else {
    res.redirect('/');
  }
});


router.get('/aboutus', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number= req.session.mobile_number;
    res.render('aboutus', {  mobile_number: mobile_number });
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
