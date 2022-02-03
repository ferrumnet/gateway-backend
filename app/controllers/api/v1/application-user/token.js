
const { db, asyncMiddleware, commonFunctions, stringHelper } = global

module.exports = function (router) {

  router.get('/', async (req, res) => {

    if (!req.headers.apikey) {
      return res.http400('apiKey in headers is required.');
    }

    let filter = {}
    filter = { apiKey: req.headers.apikey }

    try {
      let user = await db.Users.findOne(filter)
      if(user){
        return res.http200({
          token: user.createAPIToken(user)
        });
      }else {
        return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorApiKeyIsInvalid),stringHelper.strErrorApiKeyIsInvalid,);
      }
    } catch (err) {
      return res.http400(err.message);
    }

  });

};
