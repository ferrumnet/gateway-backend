const { db, asyncMiddleware, commonFunctions, stringHelper } = global;
const mailer = global.mailer;
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
var fs = require("fs");
const { v4: uuidv4 } = require("uuid");
var path = require("path");
var ejs = require("ejs");

module.exports = function (router) {
  router.post("/sign-up", async (req, res) => {
    if (
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.email ||
      !req.body.password
    ) {
      return res.http400(
        "firstName & lastName & email & password are required."
      );
    }

    let emailCount = await db.Users.count({ email: req.body.email });

    if (emailCount > 0) {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorEmailIdAlreadyExists
        ),
        stringHelper.strErrorEmailIdAlreadyExists
      );
    }

    if (req.body.firstName) {
      req.body.firstNameInLower = req.body.firstName.toLowerCase();
    }

    if (req.body.lastName) {
      req.body.lastNameInLower = req.body.lastName.toLowerCase();
    }

    req.body.name = req.body.firstName + " " + req.body.lastName;
    req.body.nameInLower = req.body.name.toLowerCase();
    req.body.role = "communityMember";
    req.body.createdAt = new Date();
    req.body.emailVerificationCodeGenratedAt = new Date();
    req.body.organization = null;
    req.body.emailVerificationCode = global.helper.getOtp();

    if (req.body.password) {
      req.body.password = db.Users.getHashedPassword(req.body.password);
    }

    let user;
    try {
      user = await db.Users.create(req.body);
      global.sendGrid.sendGridEmail(user);
    } catch (err) {
      return res.http400(err.message);
    }

    res.http200({
      user: user,
      token: user.createAPIToken(user),
    });
  });

  router.post("/sign-in", async (req, res) => {
    var filter = {};
    if (!req.body.email || !req.body.password) {
      return res.http400("email & password is required.");
    }

    filter.role = "communityMember";

    filter.email = req.body.email;
    filter.password = db.Users.getHashedPassword(req.body.password);

    let user = await db.Users.findOne(filter).populate("organization");

    if (user) {
      res.http200({
        user: user.toClientObject(),
        token: user.createAPIToken(user),
      });
    } else {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorInvalidCredentials
        ),
        stringHelper.strErrorInvalidCredentials
      );
    }
  });

  router.get("/profile/me", async (req, res) => {
    let filter = {};
    filter = { _id: req.user._id };

    let user = await db.Users.findOne(filter).populate("organization");
    res.http200({
      user: user,
    });
  });

  router.put("/update/me", async (req, res) => {
    if (!req.body.firstName || !req.body.lastName || !req.body.email) {
      return res.http400("firstName & lastName & email are required.");
    }

    req.body.updatedAt = new Date();

    req.body.name = req.body.firstName + " " + req.body.lastName;
    req.body.nameInLower = req.body.name.toLowerCase();

    delete req.body.email;
    delete req.body.password;
    delete req.body.organization;

    let user = await db.Users.findOneAndUpdate(
      { _id: req.user._id },
      req.body,
      { new: true }
    );

    if (user) {
      return res.http200({
        user: user,
      });
    } else {
      return res.http400(global.stringHelper.strErrorUserNotFound);
    }
  });

  router.post("/email/is-unique", async (req, res) => {
    try {
      const email = req.body.email;
      const isUnique = await commonFunctions.isUniqueEmail(email);
      return res.http200({ isUnique });
    } catch (e) {
      return res.http401(e);
    }
  });

  router.post("/edit/profile/otp/send/by-email", async (req, res) => {
    const uniqueEmail = await global.commonFunctions.isUniqueEmail(
      req.body.email
    );
    if (!req.body.email || !uniqueEmail) {
      return res.http400("unique email is required.");
    }

    let where = { _id: req.user._id };
    let update = {
      emailVerificationCode: global.helper.getOtp(),
      emailVerificationCodeGenratedAt: new Date(),
      emailToVerify: req.body.email,
    };

    let user = await db.Users.findOneAndUpdate(where, update, { new: true });

    if (user) {
      global.sendGrid.sendGridEmail(user, "otp", user.emailToVerify);
      return res.http200({
        message: await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strSuccessOtp
        ),
        phraseKey: stringHelper.strSuccessOtp,
      });
    } else {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorUserNotFound
        ),
        stringHelper.strErrorUserNotFound
      );
    }
  });
};
