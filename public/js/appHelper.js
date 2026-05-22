const fs = require("fs");
const path = require("path");

function checkAuthentication(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect("/");
        return;
    }
    next();
}

function alreadyLoggedIn(req, res, next) {
    if (req.session.authenticated) {
        res.redirect("/home");
        return;
    }
    next();
}

<<<<<<< HEAD
function renderPage(req, res, page, title, cssFiles = [], jsFiles = [], userData = []) {
    res.render(page, {
        title: title,
        user: req.session.authenticated,
        cssFiles: cssFiles,
        jsFiles: jsFiles,
        userData: userData
=======
function renderPage(req, res, page, title, cssFiles = []) {
    res.render(page, {
        title: title,
        user: req.session.authenticated,
        cssFiles: cssFiles
>>>>>>> sal_welcomepage_EJS_JS_CSS
    });
}

function HTMLRender(res, htmlPath) {
    const filePath = path.join(__dirname, "..", "..", "app", "html", htmlPath);
    const html = fs.readFileSync(filePath, "utf8");
    res.send(html);
}

module.exports = {checkAuthentication, alreadyLoggedIn, renderPage, HTMLRender};
