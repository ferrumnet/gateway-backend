
module.exports = function (router: any) {

  router.post('/forgot-password', async (req: any, res: any) => {

    if (!req.body.email || !req.body.url || !req.body.role) {
      return res.http400('email & url & role are required.');
    }

    let user = await db.Users.findOne({ email: req.body.email, role: req.body.role });

    if (user) {

      var planObject = {
        '_id': user._id
      }

      var token = (global as any).commonFunctions.createToken(planObject, '600s')
      user = await db.Users.findOneAndUpdate({ _id: user._id }, { forgotPasswordAuthenticationToken: token }, { new: true })
      user.link = req.body.url + token
      (global as any).sendGrid.sendGridEmail(user, 'link')

    }

    return res.http200({
      message: await commonFunctions.getValueFromStringsPhrase(stringHelper.strSuccessResetPasswordLink),
      phraseKey: stringHelper.strSuccessResetPasswordLink,
      email: req.body.email
    });

  });

  router.post('/forgot-password/authenticate/link', async (req: any, res: any) => {

    if (!req.body.token) {
      return res.http400('token is required');
    }

    try {
      let decoded = await (global as any).commonFunctions.decodeAPiToken(req.body.token)

      if (!decoded) {
        return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorLinkMessage),stringHelper.strErrorLinkMessage,);
      }

      let user = await db.Users.findOne({ _id: decoded._id, forgotPasswordAuthenticationToken: req.body.token })

      if (!user) {
        return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorLinkMessage),stringHelper.strErrorLinkMessage,);
      } else {

        user = await db.Users.findOneAndUpdate({ _id: decoded._id }, { forgotPasswordAuthenticationToken: '' }, { new: true })
        return res.http200({
          token: user.createAPIToken(user)
        });

      }

    } catch (e) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorLinkMessage),stringHelper.strErrorLinkMessage,);
    }
  });

  router.put('/reset-password', async (req: any, res: any) => {

    try {

      if (!(req.body.newPassword)) {
        return res.http400('newPassword required');
      }

      let user = await db.Users.findOne({ _id: req.user._id})

      if (user) {

        user.password = db.Users.getHashedPassword(req.body.newPassword);
        user = await db.Users.findOneAndUpdate({ _id: req.user._id }, user, { new: true })

        return res.http200({
          user: user.toClientObject(),
          token: user.createAPIToken(user)
        });

      }

    } catch (e) {
      return res.http401(e);
    }

  });

  router.post('/re-send/email/otp', async (req: any, res: any) => {

    if (!req.body.email) {
      return res.http400('email is required.');
    }

    let where = { email: req.body.email }
    let update = { emailVerificationCode: (global as any).helper.getOtp(), emailVerificationCodeGenratedAt: new Date() };

    let user = await db.Users.findOneAndUpdate(where, update, { new: true })

    if (user) {
      (global as any).sendGrid.sendGridEmail(user)
      return res.http200({
        message: await commonFunctions.getValueFromStringsPhrase(stringHelper.strSuccessOtp),
        phraseKey: stringHelper.strSuccessOtp,
      });
    } else {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorUserNotFound),stringHelper.strErrorUserNotFound,);
    }

  });

  router.post('/authenticate/email/otp', async (req: any, res: any) => {

    if (!req.body.email) {
      return res.http400('email is required.');
    }

    if (!req.body.emailVerificationCode) {
      return res.http400('One Time Password (OTP) is required.');
    }

    let query: any = {};
    query.email = req.body.email;
    query.emailVerificationCode = req.body.emailVerificationCode;

    let user = await db.Users.findOne(query)

    if (user) {

      if((global as any).helper.diffInMinuts(new Date(), user.emailVerificationCodeGenratedAt) > 10){
        return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorInvalidOtp),stringHelper.strErrorInvalidOtp,);
      }

      let update = { isEmailAuthenticated: true };
      db.Users.findOneAndUpdate({ _id: user._id }, update, { new: true })
        .then((user: any) => {
          return res.http200({
            user: user.toClientObject(),
            token: user.createAPIToken(user)
          });
        });
    } else {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorInvalidOtp),stringHelper.strErrorInvalidOtp,);
    }

  });

};
