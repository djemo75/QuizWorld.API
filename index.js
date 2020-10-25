const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
require('dotenv').config();
const app = express()
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
})
connection.connect()
const port = process.env.PORT ||  3000


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send({
      title: "Hello to QuizWorld API",
      version: "1.0.0"
  })
})

app.get('/login', (req, res) => {
  connection.query('SELECT * FROM users', function (err, rows, fields) {
    if (err) throw err
    
    if (rows) {
      res.send(rows);
    } else {
      res.send([]);
    }
  })
})

app.post('/register', (req, res) => {
  connection.query(`INSERT INTO users (username, password) VALUES (?, ?)`, [req.body.username, req.body.password], function (err, rows, fields) {
    if (err) 
    {
      res.status(400).send({
        message: "Something went wrong!"
      })
    } else {
    
      res.status(201).send({
        message: "Successfully registered!"
      })
    }
  })
})

app.listen(port, () => {
  console.log(`THE API LISTEN ON PORT: ${port}`)
})