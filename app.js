require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const ejs = require('ejs')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// initialize Session
app.use(
  session({ secret: 'keyboard cat', resave: false, saveUninitialized: false })
)

// initialize passport
app.use(passport.initialize())
// initialize passport to use the session package
app.use(passport.session())

// use mongoose to connect to mongoDB
mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true })

// ! Create user database
// Create a user Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
})

// hash and salt paswords and save the hash to our database
userSchema.plugin(passportLocalMongoose)

// sets up mongoose to use the schema
const User = new mongoose.model('user', userSchema)

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy())

// creates cookie
passport.serializeUser(User.serializeUser())
// use cookie
passport.deserializeUser(User.deserializeUser())

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
app.get('/secrets', (req, res) => {
  req.isAuthenticated ? res.render('secrets') : res.render('login')
})

app.get('/logout', (req, res) => {
  req.logOut((err) => {
    err ? console.log(err, 'unable to log out') : res.redirect('/')
  })
})

//? =========================== REgister Function
// Sets up a POST route for registering a new user
app.post('/register', (req, res) => {
  // Calls the User model's register method to create a new user in the database
  User.register(
    { username: req.body.username }, // Uses the username from the request body
    req.body.password, // Uses the password from the request body
    (err, user) => {
      // Callback function that will be called after User.register finishes
      if (err) {
        // If there was an error, logs the error message to the console
        console.log(err, 'There was an error in registering user')
        // Redirects the user back to the registration page
        res.redirect('/register')
      } else {
        // If there was no error, authenticates the user with Passport's 'local' strategy
        passport.authenticate('local')(req, res, () => {
          // Redirects the user to the secrets page
          res.redirect('/secrets')
        })
      }
    }
  )
})

//? ===================End of REgister Function

//? =========================== Login function
// login users via the form in the login file
app.post('/login', async (req, res) => {
  const user = new User({
    username: req.body.username, // Uses the username from the request body
    password: req.body.password, // Uses the password from the request body
  })
  req.logIn(user, (err) => {
    err
      ? res.redirect('/login')
      : passport.authenticate('local')(req, res, () => {
          res.redirect('/secrets')
        })
  })
})
//? =========================== end of Login function

app.listen(3000, () => {
  console.log('Server started on port 3000.')
})
