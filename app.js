// app.js
const express = require('express');
const session = require('express-session');
const routes = require('./routes/index');



const app = express();
const PORT = process.env.PORT || 4000;







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
