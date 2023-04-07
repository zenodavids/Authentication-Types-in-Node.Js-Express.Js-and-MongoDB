require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const encrypt = require('mongoose-encryption')
const ejs = require('ejs')

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// use mongoose to connect to mongoDB
mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true })

// ! Create user database
// Create a user Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
})

// use the long unguessable string to encrypt the database
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password'],
})

const User = new mongoose.model('user', userSchema)

// routes
app.get('/', (req, res) => {
  res.render('home')
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/register', (req, res) => {
  res.render('register')
})

//? =========================== REgister Function
app.post('/register', (req, res) => {
  // sign up new users via the form in the register file
  const newUser = new User({
    // "username" here is the name attribute of the input html element for the email
    email: req.body.username,

    // "password" here is the name attribute of the input html element for the password
    password: req.body.password,
  })

  // function to save the new user...
  newUser
    .save()
    // ...and grant them access to the "secrets page"
    .then((user) => {
      res.render('secrets')
    })
    .catch((err) => {
      console.log(err, 'error while saving user')
    })
})

//? ===================End of REgister Function

//? =========================== Login function
// login users via the form in the login file
app.post('/login', async (req, res) => {
  // "username" here is the name attribute of the input html element for the email
  const username = req.body.username
  // "password" here is the name attribute of the input html element for the password
  const password = req.body.password

  try {
    // find a user with the inputed email
    const foundUser = await User.findOne({ email: username })

    // if the user is found, check if the password matches
    if (foundUser.password === password) {
      // if the password matches, grant access to the "secrets" page
      res.render('secrets')
    }
  } catch (err) {
    console.log(
      err,
      'there was an issue finding the email that matches the user'
    )
  }

  // User.findOne({ email: username }, (err, foundUser) => {
  //   if (err) {
  //     console.log(
  //       err,
  //       'there was an issue finding the email that matches the user'
  //     )
  //   } else {
  //
  //     if (foundUser.password === password) {
  //
  //       res.render('secrets')
  //     }
  //   }
  // })
})
//? =========================== end of Login function

app.listen(3000, () => {
  console.log('Server started on port 3000.')
})
