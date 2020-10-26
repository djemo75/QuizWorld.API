const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./database/config');
const apiRoutes = require('./routes/apiRoutes');
require('dotenv').config();

const port = process.env.PORT || 3000;
const app = express();

// General endpoints handling
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// General error handling
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
  next();
});

app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`REST API listening on port:: ${port}`);
});
