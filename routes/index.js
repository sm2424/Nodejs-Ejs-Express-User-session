// routes/index.js
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const db = require("../config/db");


// Add body-parser middleware
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  // Check if the session is active
  if (req.session.isAuthenticated) {
    // If the session is active, check if the session UUID exists in the database
    const sessionId = req.sessionID;
    const sqlCheckUUID = 'SELECT * FROM users WHERE uuid = ?';
    db.query(sqlCheckUUID, [sessionId], (err, result) => {
      if (err) {
        console.error('Error checking session UUID:', err);
        res.render('error', { error: 'An error occurred. Please try again.' });
      } else {
        if (result.length > 0) {
          // If session UUID exists, redirect to dashboard page
          req.session.isAuth = true;
          const mobile_number = result[0].mobile_number;
          req.session.mobile_number = mobile_number;
          res.redirect('/dashboard');
        } else {
          // If session UUID doesn't exist, render login page
          res.render('login', { mobile_number: req.session.mobile_number });
        }
      }
    });
  } else {
    // If the session is not active, render the login page
    res.render('login', { mobile_number: req.session.mobile_number });
  }
});

    
router.post('/get-otp', (req, res) => {
  const enteredmobile_number = req.body.mobile_number;

  // Check if the mobile number exists in the database
  const sqlCheckMobile = 'SELECT * FROM users WHERE mobile_number = ?';
  db.query(sqlCheckMobile, [enteredmobile_number], (err, result) => {
    if (err) {
      console.error('Error checking mobile number:', err);
      res.render('login', { error: 'An error occurred. Please try again.' });
    } else {
      if (result.length > 0) {
        const username = result[0].username;
        req.session.isAuthenticated = true;
        req.session.mobile_number = enteredmobile_number;
        req.session.username = username;
        res.redirect('/dashboard');
      } else {
        // Generate OTP if mobile number doesn't exist
        const generatedOTP = '123456'; // For simplicity

        // Store mobile number, OTP, UUID in the database
        const sqlInsert = 'INSERT INTO users (mobile_number, otp, uuid) VALUES (?, ?, ?)';
        const sessionId = req.sessionID; // Access the session ID
        db.query(sqlInsert, [enteredmobile_number, generatedOTP, sessionId], (err, result) => {
          if (err) {
            console.error('Error storing mobile number and OTP:', err);
            res.render('login', { error: 'An error occurred. Please try again.' });
          } else {
            req.session.mobile_number = enteredmobile_number;
            res.render('otp');
          }
        });
      }
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
      
      // const sessionId = uuid.v4(); // Generate UUID for session ID
      // console.log("Session UUID:", sessionId); // Print session UUID to the terminal
      
      res.redirect('/dashboard');
    } else {
      res.render('otp', { error: 'Invalid OTP. Please try again.' });
    }
  });
});
  

router.get('/dashboard', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session

    res.render('dashboard', { mobile_number, username });
  } else {
    res.redirect('/');
  }
});

router.get('/profile', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    const phone_number_id = req.session.phone_number_id; // Assuming phone_number_id is stored in session
    const fb_pat = req.session.fb_pat; // Assuming fb_pat is stored in session
    res.render('profile', { pageTitle: 'User Profile', isLoggedIn: true, mobile_number, username, phone_number_id, fb_pat });
  } else {
    res.redirect('/');
  }
});

router.post('/save-profile', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const { name, phone_number_id, fb_pat } = req.body;
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session

    // Update profile details in the database
    const sql = 'UPDATE users SET username = ?, phone_number_id = ?, fb_pat = ? WHERE mobile_number = ?';
    db.query(sql, [name, phone_number_id, fb_pat, mobile_number], (err, result) => {
      if (err) {
        console.error('Error updating profile:', err);
        res.render('error', { error: 'An error occurred while updating profile.' });
      } else {
        console.log('Profile updated successfully');


        // Fetch the updated username from the database
        const sqlFetchUsername = 'SELECT username FROM users WHERE mobile_number = ?';
        db.query(sqlFetchUsername, [mobile_number], (err, result) => {
          if (err) {
            console.error('Error fetching user details:', err);
            res.render('error', { error: 'An error occurred while fetching user details.' });
          } else {
            if (result.length > 0) {
              const newUsername = result[0].username;
              // Update session with the new username
              req.session.username = newUsername;
              // Redirect to profile page or any other appropriate page
              console.log('Profile updated successfully');
              res.redirect('/viewprofile');
              
            } else {
              res.render('error', { error: 'User not found.' });
            }
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
});

router.get('/viewprofile', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session

    // Fetch user details from the database
    const sql = 'SELECT * FROM users WHERE mobile_number = ?';
    db.query(sql, [mobile_number], (err, result) => {
      if (err) {
        console.error('Error fetching user details:', err);
        res.render('error', { error: 'An error occurred while fetching user details.' });
      } else {
        if (result.length > 0) {
          const { username, phone_number_id, fb_pat } = result[0];
          res.render('viewprofile', { mobile_number, username, phone_number_id, fb_pat });
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
    const username = req.session.username; // Assuming username is stored in session

    // Fetch user details from the database
    const sql = 'SELECT * FROM users WHERE mobile_number = ?';
    db.query(sql, [mobile_number], (err, result) => {
      if (err) {
        console.error('Error fetching user details:', err);
        res.render('error', { error: 'An error occurred while fetching user details.' });
      } else {
        if (result.length > 0) {
          const { username, phone_number_id, fb_pat } = result[0];
          res.render('profile', { mobile_number, username, phone_number_id, fb_pat }); // Make sure to pass username here
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
    const username = req.session.username; // Assuming username is stored in session
    res.render('aboutus', {  mobile_number, username });
  } else {
    res.redirect('/');
  }
});

router.get('/logout', (req, res) => {
        //Destory the session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        } else {
          res.redirect('/');
        }
      });
    });
  



module.exports = router;
