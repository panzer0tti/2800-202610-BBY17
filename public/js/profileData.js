require('dotenv').config();
const Joi = require("joi");
const {Binary} = require('mongodb');
const fs = require('fs');

const mongodb_database = process.env.MONGODB_DATABASE;

const {database} = require('./mongoDBConnection');
const {sendErrorMessage} = require('./authentication');
const {renderPage} = require('./appHelper');
const userCollection = database.db(mongodb_database).collection('users');

// Retrieve the authenticated user's details from the database and render the profile page
async function displayUserInfo(req, res) {
    const email = req.session.email;
    const user = await userCollection.findOne({email: email});
    const userData = [user.name, user.email, user.city, user.phoneNum];

    renderPage(req, res, "profile", "Profile", [], ["profile.js"], userData);
}

// Process and sanitize incoming form data to update the user's profile information
async function updateUserInfo(req, res) {
    const email = req.session.email;
    const tempName = req.body.name;
    const tempLocation = req.body.location;
    const phoneNum = req.body.phoneNum;

    const isValid = validateUserInfo(req, res, tempName, tempLocation, phoneNum);
    if (!isValid) {
        return;
    }

    const name = tempName.trim();
    const location = toTitleCase(tempLocation.trim());
    await userCollection.updateOne({email: email}, {$set: {name: name, city: location, phoneNum: phoneNum}});
    res.redirect("/profile");
}

// Validate profile update fields against predefined schema requirements
function validateUserInfo(req, res, name, location, phoneNum) {
    const schema = Joi.object({
        name: Joi.string().max(20).required(),
        location: Joi.string().max(20).allow(''),
        phoneNum: Joi.string().pattern(/^\d{3}-\d{3}-\d{4}$/).allow('')
    });

    const validationResult = schema.validate({name, location, phoneNum});
    if (validationResult.error) {
        const profileDataError = findProfileDataError(name, location, phoneNum);
        sendErrorMessage(req, res, "Invalid Input", profileDataError, "/profile", "Profile");
        return false;
    }
    return true;
}

// Generate specific error messages based on validation failures in the profile form
function findProfileDataError(name, location, phoneNum) {
    let profileDataError = [];
    if (!name && !location && !phoneNum) {
        return ["Do not press 'Save' without editing any fields."];
    }
    if (name.length == 0) {
        profileDataError.push("Name is required.");
    }
    if (name.length > 20) {
        profileDataError.push("Name must be less than 20 characters.");
    }
    if (location.length > 20) {
        profileDataError.push("Location must be less than 20 characters.");
    }
    if (phoneNum.length > 0 && !/^\d{3}-\d{3}-\d{4}$/.test(phoneNum)) {
        profileDataError.push("Phone number must be in the format XXX-XXX-XXXX.");
    }
    return profileDataError || null;
}

// Utility function to convert strings to title case format
function toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Process an uploaded image file, convert it to a binary buffer, and store it in the database
async function uploadProfilePic(req, res) {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const email = req.session.email;
        
        const imageBuffer = fs.readFileSync(req.file.path);
        
        await userCollection.updateOne(
            {email: email},
            {$set: { 
                profilePic: {
                    data: new Binary(imageBuffer),
                    type: req.file.mimetype
                }
            }}
        );

        fs.unlinkSync(req.file.path);

        res.status(200).send("Upload successful");
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        res.status(500).send("Internal server error");
    }
}

// Retrieve and serve the user's stored profile picture, or fallback to a default avatar
async function getProfilePic(req, res) {
    try {
        const email = req.session.email;
        const user = await userCollection.findOne({email: email});

        if (user && user.profilePic?.data) {
            res.set('Content-Type', user.profilePic?.type);
            res.send(user.profilePic?.data.buffer);
        } else {
            res.redirect("/img/default-avatar.jpg");
        }
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        res.status(500).send("Internal server error");
    }
}

module.exports = {displayUserInfo, updateUserInfo, uploadProfilePic, getProfilePic};
