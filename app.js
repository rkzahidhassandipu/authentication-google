require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ejs = require("ejs");
const app = express();
require("./config/database");
require("./config/passport");
const User = require("./models/user.model");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")

app.set("view engine", "ejs");
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions"
  }),
//   cookie: { secure: true }

}));

app.use(passport.initialize());
app.use(passport.session());

// base url
app.get("/", (req, res) => {
    res.render("index")
});

const checkLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return res.redirect("/profile");
    }
    next();
}

// login page : get
app.get("/login", checkLoggedIn, (req, res) => {
    res.render("./layout/login")
});

const checkAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }
));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', successRedirect: "/profile" }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
});

// profile page : get
app.get("/profile", checkAuthenticated, (req, res) => {
    res.render("./layout/profile", {username: req.user.username});
});

// lagout page : get
app.get("/logout", (req, res, next) => {
    try {
        req.logout((err) => {
            if(err){
                return next(err)
            }
            res.redirect("/");
        })
    } catch (error) {
        res.status(500).send(error.message)
    }
});


module.exports = app;