require("dotenv").config();

const bcrypt = require("bcrypt");
const Joi = require("joi");

const saltRounds = 12;
const expireTime = 60 * 60 * 1000;

const mongodbDatabase = process.env.MONGODB_DATABASE;

const { database } = require("./mongoDBConnection");
const userCollection = database.db(mongodbDatabase).collection("users");

function sendErrorMessage(req, res, title, message, link, button) {
  res.render("popup-message", {
    title: title,
    message: message,
    link: link,
    button: "Back to " + button,
    alertType: "danger",
    user: req.session.authenticated,
    cssFiles: [],
  });
}

function makeNewSession(req, name, email, firstTime) {
  req.session.authenticated = true;
  req.session.name = name;
  req.session.email = email;
  req.session.firstTime = firstTime;
  req.session.cookie.maxAge = expireTime;
}

async function signupSubmit(req, res) {
  const name = req.body.name || "";
  const email = req.body.email || "";
  const password = req.body.password || "";
  const question = req.body.question || "";
  const answer = req.body.answer || "";

  const schema = Joi.object({
    name: Joi.string().max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .max(20)
      .pattern(/[A-Z]/)
      .pattern(/[a-z]/)
      .pattern(/[0-9]/)
      .required(),
    question: Joi.string().required(),
    answer: Joi.string().max(20).required(),
  });

  const validationResult = schema.validate({
    name,
    email,
    password,
    question,
    answer,
  });

  if (validationResult.error) {
    const signupError = findSignupError(
      name,
      email,
      password,
      question,
      answer
    );

    sendErrorMessage(
      req,
      res,
      "Signup Error",
      signupError,
      "/signup",
      "Signup"
    );

    return;
  }

  const existingUser = await userCollection.findOne({ email: email });

  if (existingUser) {
    sendErrorMessage(
      req,
      res,
      "Signup Error",
      ["Email is already in use."],
      "/signup",
      "Signup"
    );

    return;
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const hashedAnswer = await bcrypt.hash(answer, saltRounds);

  await userCollection.insertOne({
    name: name.trim(),
    email: email,
    password: hashedPassword,
    question: question,
    answer: hashedAnswer,
    firstTime: true,
  });

  makeNewSession(req, name.trim(), email, true);
  res.redirect("/home");
}

async function loginSubmit(req, res) {
  const email = req.body.email || "";
  const password = req.body.password || "";

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const validationResult = schema.validate({ email, password });

  if (validationResult.error) {
    const loginError = findLoginError(email, password);

    sendErrorMessage(
      req,
      res,
      "Login Error",
      loginError,
      "/login",
      "Login"
    );

    return;
  }

  const user = await userCollection.findOne(
    { email: email },
    {
      projection: {
        name: 1,
        email: 1,
        password: 1,
        firstTime: 1,
      },
    }
  );

  if (!user) {
    sendErrorMessage(
      req,
      res,
      "Login Error",
      ["User not found."],
      "/login",
      "Login"
    );

    return;
  }

  if (await bcrypt.compare(password, user.password)) {
    if (user.firstTime) {
      await userCollection.updateOne(
        { email: email },
        { $set: { firstTime: false } }
      );
    }

    makeNewSession(req, user.name, user.email, false);
    res.redirect("/home");
  } else {
    sendErrorMessage(
      req,
      res,
      "Login Error",
      ["Incorrect password."],
      "/login",
      "Login"
    );
  }
}

async function backupLoginSubmit(req, res) {
  const email = req.body.email || "";
  const question = req.body.question || "";
  const answer = req.body.answer || "";

  const schema = Joi.object({
    email: Joi.string().email().required(),
    question: Joi.string().required(),
    answer: Joi.string().max(20).required(),
  });

  const validationResult = schema.validate({ email, question, answer });

  if (validationResult.error) {
    const backupLoginError = findBackupLoginError(
      email,
      question,
      answer
    );

    sendErrorMessage(
      req,
      res,
      "Backup Login Error",
      backupLoginError,
      "/backupLogin",
      "Backup Login"
    );

    return;
  }

  const user = await userCollection.findOne(
    { email: email },
    {
      projection: {
        name: 1,
        email: 1,
        question: 1,
        answer: 1,
      },
    }
  );

  if (!user) {
    sendErrorMessage(
      req,
      res,
      "Backup Login Error",
      ["User not found."],
      "/backupLogin",
      "Backup Login"
    );

    return;
  }

  if (user.question !== question) {
    sendErrorMessage(
      req,
      res,
      "Backup Login Error",
      ["Incorrect security question."],
      "/backupLogin",
      "Backup Login"
    );

    return;
  }

  if (await bcrypt.compare(answer, user.answer)) {
    makeNewSession(req, user.name, user.email, false);
    res.redirect("/home");
  } else {
    sendErrorMessage(
      req,
      res,
      "Backup Login Error",
      ["Incorrect answer."],
      "/backupLogin",
      "Backup Login"
    );
  }
}

function findSignupError(name, email, password, question, answer) {
  const signupError = [];

  if (emptyEntrySubmitted(name, email, password, question, answer)) {
    signupError.push("Please fill in all fields.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    signupError.push("Please enter a valid email address.");
  }

  if (name.length > 20) {
    signupError.push("Name must be less than 20 characters.");
  }

  if (answer.length > 20) {
    signupError.push("Answer must be less than 20 characters.");
  }

  if (password.length < 8 || password.length > 20) {
    signupError.push("Password must be between 8 and 20 characters.");
  }

  if (!/[A-Z]/.test(password)) {
    signupError.push("Password must contain at least one uppercase letter.");
  }

  if (!/[a-z]/.test(password)) {
    signupError.push("Password must contain at least one lowercase letter.");
  }

  if (!/[0-9]/.test(password)) {
    signupError.push("Password must contain at least one digit.");
  }

  return signupError;
}

function findLoginError(email, password) {
  const loginError = [];

  if (email.length === 0 || password.length === 0) {
    loginError.push("Please fill in all fields.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    loginError.push("Please enter a valid email address.");
  }

  return loginError;
}

function findBackupLoginError(email, question, answer) {
  const backupLoginError = [];

  if (
    email.length === 0 ||
    question.length === 0 ||
    answer.length === 0
  ) {
    backupLoginError.push("Please fill in all fields.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    backupLoginError.push("Please enter a valid email address.");
  }

  return backupLoginError;
}

function emptyEntrySubmitted(name, email, password, question, answer) {
  return (
    name.length === 0 ||
    email.length === 0 ||
    password.length === 0 ||
    question.length === 0 ||
    answer.length === 0
  );
}

module.exports = {
  signupSubmit,
  loginSubmit,
  backupLoginSubmit,
  sendErrorMessage,
};
