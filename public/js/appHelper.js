const fs = require("fs");
const path = require("path");

// Middleware to ensure the user is authenticated before accessing a route
function checkAuthentication(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect("/");
        return;
    }
    next();
}

// Middleware to redirect already authenticated users away from login/signup pages
function alreadyLoggedIn(req, res, next) {
    if (req.session.authenticated) {
        res.redirect("/home");
        return;
    }
    next();
}

// Standardize page rendering with common variables like title and user state
function renderPage(req, res, page, title, cssFiles = [], jsFiles = [], userData = []) {
    res.render(page, {
        title: title,
        user: req.session.authenticated,
        cssFiles: cssFiles,
        jsFiles: jsFiles,
        userData: userData
    });
}

// Serve a static HTML file from the app directory
function HTMLRender(res, htmlPath) {
    const filePath = path.join(__dirname, "..", "..", "app", "html", htmlPath);
    const html = fs.readFileSync(filePath, "utf8");
    res.send(html);
}

module.exports = {checkAuthentication, alreadyLoggedIn, renderPage, HTMLRender};
