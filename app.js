// app.js
const express = require('express');
const session = require('express-session');
const routes = require('./routes/index');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 4000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

global.db = db;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.use('/', routes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
