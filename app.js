/* ── Environment & Module Dependencies ── */
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const mongoose = require("mongoose");
const mongoSanitizer = require("mongo-sanitizer").default;
const multer = require("multer");
const upload = multer({dest: "uploads/"});

/* ── Express Application Setup ── */
const app = express();
const PORT = process.env.PORT || 2800;

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/app/html"));
app.use(express.json());

app.use(mongoSanitizer({replaceWith: "_"}));

/* ── Database Connection ── */
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const mongoURL = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`;

// Establish connection to the MongoDB Atlas cluster and start the Express server
mongoose.connect(mongoURL)
    .then(() => {
        console.log("MongoDB is connected to the server.");

        app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed: ", err);
    });

/* ── Custom Module Imports ── */
const {checkAuthentication, alreadyLoggedIn} = require("./public/js/appHelper");
const {renderPage, HTMLRender} = require("./public/js/appHelper");
const {signupSubmit, loginSubmit} = require("./public/js/authentication");
const {backupLoginSubmit, deleteAccount} = require("./public/js/authentication");
const {displayLoginHistory} = require("./public/js/authentication");
const {displayUserInfo, updateUserInfo} = require("./public/js/profileData");
const {uploadProfilePic, getProfilePic} = require("./public/js/profileData");
const {verifyIdentity, changePasswordSubmit} = require("./public/js/changePassword");
const {canChangePassword} = require("./public/js/changePassword");
const {apiScan} = require("./public/js/plantScanAPI");
const gameManager = require("./public/js/gameManager");

/* ── Global NavLinks ── */
const navLinksUnauth = [
  {name: "Welcome", url: "/"},
  {name: "Sign Up", url: "/signup"},
  {name: "Log In", url: "/login"},
  {name: "Backup Log In", url: "/backupLogin"}
];

const navLinksAuth = [
  {name: "Home", url: "/home"},
  {name: "Scan Plant", url: "/plant-scan"},
  {name: "Plant Map", url: "/plant-map"},
  {name: "My Plants", url: "/my-plants"},
  {name: "Encyclopedia", url: "/encyclopedia"},
  {name: "Plant Games", url: "/plant-game"},
  {name: "Settings", url: "/settings"},
  {name: "Logout", url: "/logout"}
];

/* ── Session & Middleware ── */

// Inject dynamic routing paths and navigation arrays into local variables for EJS templates
app.use((req, res, next) => {
  const pathFolders = req.path.split("/").slice(1);
  const folder = "/" + pathFolders[0];
  app.locals.folder = folder;
  app.locals.navLinksAuth = navLinksAuth;
  app.locals.navLinksUnauth = navLinksUnauth;
  next();
});

var mongoStore = MongoStore.create({
  mongoUrl: mongoURL,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
  }),
);

/* ── App Routes ── */

// Public Welcome Page
app.get("/", alreadyLoggedIn, (req, res) => {
  res.render("welcome");
});

// Signup Page
app.get("/signup", alreadyLoggedIn, (req, res) => {
  renderPage(req, res, "signup", "Sign Up");
});

// Signup Handler
app.post("/signupSubmit", signupSubmit);

// Login Page
app.get("/login", alreadyLoggedIn, (req, res) => {
  renderPage(req, res, "login", "Log In");
});

// Login Handler
app.post("/loginSubmit", loginSubmit);

// Backup Login Page
app.get("/backupLogin", alreadyLoggedIn, (req, res) => {
  renderPage(req, res, "backup-login", "Backup Log In");
});

// Backup Login Handler
app.post("/backupLoginSubmit", backupLoginSubmit);

// Static Homepage
app.get("/home", checkAuthentication, (req, res) => {
  HTMLRender(res, "home.html");
});

// Plant Map Page
app.get("/plant-map", checkAuthentication, (req, res) => {
  renderPage(req, res, "plant-map", "Plant Map", ["plant-map.css"], ["plant-map.js"]);
});

// Plant Scan Page
app.get("/plant-scan", checkAuthentication, (req, res) => {
  renderPage(req, res, "plant-scan", "Scan Plant", ["plant-scan.css"], ["plant-scan.js"]);
});

// My Plants Page
app.get("/my-plants", checkAuthentication, (req, res) => {
  renderPage(req, res, "my-plants", "My Plants", ["my-plants.css"], ["my-plants.js"]);
})

// Plant Scan API Handler
app.post("/scanningPlant", checkAuthentication, upload.single('plantImage'), apiScan);

// Encyclopedia Page
app.get("/encyclopedia", checkAuthentication, (req, res) => {
  renderPage(req, res, "encyclopedia", "Plant Encyclopedia", ["encyclopedia.css"], ["encyclopedia.js"]);
});

// Plant Games Page
app.use("/plant-game", checkAuthentication, gameManager);

// Settings Page
app.get("/settings", checkAuthentication, (req, res) => {
  renderPage(req, res, "settings", "Settings");
});

// Login History Page
app.get("/login-history", checkAuthentication, displayLoginHistory);

// Delete Account Handler
app.post("/deleteAccount", checkAuthentication, deleteAccount);

// Profile Page
app.get("/profile", checkAuthentication, displayUserInfo);

// Get Profile Picture Handler
app.get("/getProfilePic", checkAuthentication, getProfilePic);

// Update Profile Handler
app.post("/updateProfile", checkAuthentication, updateUserInfo);

// Change Profile Picture Handler
app.post("/updateProfilePic", checkAuthentication, upload.single('profilePic'), uploadProfilePic);

// Change Password Security Page
app.get("/changePassword", checkAuthentication, (req, res) => {
  renderPage(req, res, "change-password", "Change Password");
});

// Change Password Security Handler
app.post("/changePasswordSubmit", checkAuthentication, verifyIdentity);

// Change Password Form Page
app.get("/changePasswordForm", checkAuthentication, canChangePassword, (req, res) => {
  renderPage(req, res, "change-password-form", "Change Password");
});

// Change Password Form Handler
app.post("/changePasswordFormSubmit", checkAuthentication, changePasswordSubmit);

// Logout Handler
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// 404 Page-not-found Page
app.use((req, res) => {
  res.status(404);
  renderPage(req, res, "404", "404 - Page not found");
});
