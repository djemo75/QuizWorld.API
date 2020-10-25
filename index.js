const express = require('express')
const app = express()
const port = process.env.PORT ||  3000

app.get('/', (req, res) => {
  res.send({
      title: "Hello to QuizWorld API",
      version: "1.0.0",
      usedDB: process.env.DATABASE_NAME
  })
})

app.listen(port, () => {
  console.log(`THE API LISTEN ON PORT: ${port}`)
})