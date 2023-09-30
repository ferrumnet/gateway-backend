
var jwt = require("jsonwebtoken");

module.exports = function (router: any) {
  router.post("/sign-up", async (req: any, res: any) => {
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
    req.body.emailVerificationCode = (global as any).helper.getOtp();

    if (req.body.password) {
      req.body.password = db.Users.getHashedPassword(req.body.password);
    }

    let user;
    try {
      user = await db.Users.create(req.body);
      (global as any).sendGrid.sendGridEmail(user);
    } catch (err: any) {
      return res.http400(err.message);
    }

    res.http200({
      user: user.toClientObject(),
      token: user.createAPIToken(user),
    });
  });

  router.post("/sign-in", async (req: any, res: any) => {
    var filter: any = {};
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

  router.get("/profile/me", async (req: any, res: any) => {
    let filter = {};
    filter = { _id: req.user._id };

    let user = await db.Users.findOne(filter).populate("organization");
    res.http200({
      user: user.toClientObject(),
    });
  });

  router.put("/update/me", async (req: any, res: any) => {
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
        user: user.toClientObject(),
      });
    } else {
      return res.http400((global as any).stringHelper.strErrorUserNotFound);
    }
  });

  router.post("/email/is/unique", async (req: any, res: any) => {
    try {
      const email = req.body.email;
      const isUnique = await commonFunctions.isUniqueEmail(email);
      return res.http200({ isUnique });
    } catch (e) {
      return res.http401(e);
    }
  });

  router.put("/profile/re-send/email/otp", async (req: any, res: any) => {
    const uniqueEmail = await (global as any).commonFunctions.isUniqueEmail(
      req.body.email
    );
    if (!req.body.email || !uniqueEmail) {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorUniqueEmailRequired
        ),
        stringHelper.strErrorUniqueEmailRequired
      );
    }

    let where = { _id: req.user._id };
    let update = {
      emailVerificationCode: (global as any).helper.getOtp(),
      emailVerificationCodeGenratedAt: new Date(),
      emailToVerify: req.body.email,
    };

    let user = await db.Users.findOneAndUpdate(where, update, { new: true });

    if (user) {
      (global as any).sendGrid.sendGridEmail(user, "otp", user.emailToVerify);
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
  }
  );

  router.post("/edit/profile/update/email", async (req: any, res: any) => {
      let user = req.user;
      if (
        user.emailToVerify &&
        (global as any).commonFunctions.isUniqueEmail(user.emailToVerify) &&
        user.emailVerificationCode === req.body.otp
      ) {
        const email = user.emailToVerify;
        var filter = { _id: user._id };
        var update = {
          email,
          emailVerificationCode: "",
          emailToVerify: "",
          isEmailAuthenticated: true,
        };
        user = await db.Users.findOneAndUpdate(filter, update, { new: true });
        return res.http200("updated");
      } else {
        return res.http400("invalid email or otp");
      }
    }
  );

  router.put("/sign-out", async (req: any, res: any) => {
    usersHelper.signOut(req, res);
  });
};
