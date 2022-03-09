const { asyncMiddleware, commonFunctions, utils, db } = global;

module.exports = function (router) {
  router.post("/create", asyncMiddleware(async (req, res) => {
      const orgFilter = { user: req.user.id, _id: req.body.organization };
      const packFilter = { _id: req.body.package, isActive: true };
      const subFilter = {package: req.body.package, organization: req.body.organization };
      const payload = {
        organization: req.body.organization,
        package: req.body.package,
        usedLimit: 0,
        createdByUser: req.user.id,
      };
      const org = await db.Organizations.countDocuments(orgFilter);
      if (org > 0) {
        const package = await db.Package.find(packFilter);
        if (package) {
          let subscription = await db.Subscription.countDocuments(subFilter);
          if (subscription < 1) {
            payload.actualLimit = package.limitation;
            subscription = await db.Subscription.create(payload);
            return res.http200(subscription);
          }          
          return res.http404(
            await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorSubscriptionAlreadyExists ),
            stringHelper.strErrorSubscriptionAlreadyExists
          );
        }
        return res.http404(
          await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorPackageNotFound ),
          stringHelper.strErrorPackageNotFound
        );
      }
      return res.http404(
        await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNotFoundOrganization ),
        stringHelper.strErrorNotFoundOrganization
      );
    })
  );

  router.get("/of/associated/organization", asyncMiddleware(async (req, res) => {    
    let filter = { organization: req.user.organization };
    if(req.query.isActive){
      filter.isActive = req.query.isActive
    }      
    const subscription = await db.Subscription.find(filter);
    return res.http200(subscription);
    })
  );
};
