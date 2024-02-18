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
    // If the session is active, redirect to dashboard
    res.redirect('/dashboard');
  } else {
    // If the session is not active, render the login page
    res.render('login', { mobile_number: req.session.mobile_number });
  }
});

router.post('/get-otp', (req, res) => {
  const enteredMobileNumber = req.body.mobile_number;

  // Check if the mobile number exists in the database
  const sqlCheckMobile = 'SELECT * FROM users WHERE mobile_number = ?';
  db.query(sqlCheckMobile, [enteredMobileNumber], (err, result) => {
    if (err) {
      console.error('Error checking mobile number:', err);
      res.render('login', { error: 'An error occurred. Please try again.' });
    } else {
      if (result.length > 0) {
        // Mobile number exists, initiate session and redirect to verify OTP
        const username = result[0].username;
        req.session.isAuthenticated = true;
        req.session.mobile_number = enteredMobileNumber;
        req.session.username = username;
        res.redirect('/verify-otp');
      } else {
        // Mobile number doesn't exist, treat as new user
        // Generate a new OTP and proceed with registration
        const generatedOTP = "123456"; // Fixed OTP for new users
        const sessionId = uuid.v4(); // Generate UUID for session ID
        console.log("Session UUID:", sessionId); // Print session UUID to the terminal

        // Store the generated OTP in the database for verification later
        const sqlInsertUser = 'INSERT INTO users (mobile_number, otp, uuid) VALUES (?, ?, ?)';
        db.query(sqlInsertUser, [enteredMobileNumber, generatedOTP, sessionId], (err, result) => {
          if (err) {
            console.error('Error inserting new user:', err);
            res.render('login', { error: 'An error occurred. Please try again.' });
          } else {
            // Initiate session and redirect to verify OTP
            req.session.isAuthenticated = true;
            req.session.mobile_number = enteredMobileNumber;
            res.redirect('/verify-otp');
          }
        });
      }
    }
  });
});

router.get('/verify-otp', (req, res) => {
  // Render OTP verification page
  res.render('otp');
});

router.post('/verify-otp', (req, res) => {
  const enteredOTP = req.body.otp;
  const enteredMobileNumber = req.session.mobile_number;

  // Check if the provided OTP is valid
  const sql = 'SELECT * FROM users WHERE mobile_number = ? AND otp = ?';
  db.query(sql, [enteredMobileNumber, enteredOTP], (err, result) => {
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
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    res.render('dashboard', { mobile_number, username });
  } else {
    res.redirect('/');
  }
});

router.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

router.get('/profileread', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    const phone_number_id = req.session.phone_number_id; // Assuming phone_number_id is stored in session
    const fb_pat = req.session.fb_pat; // Assuming fb_pat is stored in session
    res.render('profileread', { pageTitle: 'User Profile', isLoggedIn: true, mobile_number, username, phone_number_id, fb_pat });
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
          res.render('profileread', { mobile_number, username, phone_number_id, fb_pat }); // Make sure to pass username here
        } else {
          res.render('error', { error: 'User not found.' });
        }
      }
    });
  } else {
    res.redirect('/');
  }
});

// router.get('/profile', (req, res) => {
//   // Check if the user is authenticated
//   if (req.session.isAuthenticated) {
//     const mobile_number = req.session.mobile_number;
//     const username = req.session.username; // Assuming username is stored in session

//     // Fetch user details from the database
//     const sql = 'SELECT * FROM users WHERE mobile_number = ?';
//     db.query(sql, [mobile_number], (err, result) => {
//       if (err) {
//         console.error('Error fetching user details:', err);
//         res.render('error', { error: 'An error occurred while fetching user details.' });
//       } else {
//         if (result.length > 0) {
//           const { username, phone_number_id, fb_pat } = result[0];
//           res.render('profile', { mobile_number, username, phone_number_id, fb_pat });
//         } else {
//           res.render('error', { error: 'User not found.' });
//         }
//       }
//     });
//   } else {
//     res.redirect('/');
//   }
// });


router.get('/profile', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    res.render('profile', { mobile_number, username});
  } else {
    res.redirect('/');
  }
});

router.post("/profile", (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const action = req.body.action;
    if (action === 'fetch') {
      const mobile_number = req.session.mobile_number; // Retrieve mobile number from session
      const sql = 'SELECT * FROM users WHERE mobile_number = ?';
      db.query(sql, [mobile_number], (err, data) => {
        if (err) {
          console.error('Error fetching sample data:', err);
          res.status(500).json({ error: 'An error occurred while fetching sample data.' });
        } else {
          res.json({ data });
        }
      });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});







router.get('/sample_data', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    const title = "Node JS Ajax CRUD Application"
    res.render('sample_data', { mobile_number, username, title });
  } else {
    res.redirect('/');
  }
});

router.post("/sample_data", (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const action = req.body.action;
    if (action === 'fetch') {
      const query = "SELECT * FROM sample_data ORDER BY id DESC";
      db.query(query, (error, data) => {
        if (error) {
          console.error('Error fetching sample data:', error);
          res.status(500).json({ error: 'An error occurred while fetching sample data.' });
        } else {
          res.json({ data });
        }
      });
    } else if (action === 'Add') {
      const { first_name, last_name, age, gender } = req.body;
      const query = `
        INSERT INTO sample_data 
        (first_name, last_name, age, gender) 
        VALUES (?, ?, ?, ?)
      `;
      db.query(query, [first_name, last_name, age, gender], (error, data) => {
        if (error) {
          console.error('Error adding sample data:', error);
          res.status(500).json({ error: 'An error occurred while adding sample data.' });
        } else {
          res.json({ message: 'Data Added' });
        }
      });
    } else if (action === 'fetch_single') {
      const id = req.body.id;
      const query = `SELECT * FROM sample_data WHERE id = ?`;
      db.query(query, [id], (error, data) => {
        if (error) {
          console.error('Error fetching single record:', error);
          res.status(500).json({ error: 'An error occurred while fetching single record.' });
        } else {
          res.json(data[0]);
        }
      });
    } else if (action === 'Edit') {
      const { id, first_name, last_name, age, gender } = req.body;
      const query = `
        UPDATE sample_data 
        SET first_name = ?, 
            last_name = ?, 
            age = ?, 
            gender = ? 
            WHERE id = ?
          `;
      db.query(query, [first_name, last_name, age, gender, id], (error, data) => {
        if (error) {
          console.error('Error editing record:', error);
          res.status(500).json({ error: 'An error occurred while editing record.' });
        } else {
          res.json({ message: 'Data Edited' });
        }
      });
    } else if (action === 'delete') {
      const id = req.body.id;
      const query = `DELETE FROM sample_data WHERE id = ?`;
      db.query(query, [id], (error, data) => {
        if (error) {
          console.error('Error deleting record:', error);
          res.status(500).json({ error: 'An error occurred while deleting record.' });
        } else {
          res.json({ message: 'Data Deleted' });
        }
      });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});


router.get('/aboutus', (req, res) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    const mobile_number = req.session.mobile_number;
    const username = req.session.username; // Assuming username is stored in session
    res.render('aboutus', { mobile_number, username });
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
