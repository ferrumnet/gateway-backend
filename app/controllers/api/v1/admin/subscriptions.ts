module.exports = function (router: any) {
  router.post("/create", asyncMiddleware(async (req: any, res: any) => {
      const orgFilter = {_id: req.body.organization };
      const packFilter = { _id: req.body.package, isActive: true };
      const subFilter = {package: req.body.package, organization: req.body.organization };
      let payload: any = {
        organization: req.body.organization,
        package: req.body.package,
        usedLimit: 0,
        createdByUser: req.user.id,
      };
      const org = await db.Organizations.countDocuments(orgFilter);
      if (org > 0) {
        let packageRes = await db.Package.findOne(packFilter);
        if (packageRes) {
          let subscription = await db.Subscription.countDocuments(subFilter);
          if (subscription < 1) {
            payload.actualLimit = packageRes.limitation;
            subscription = await db.Subscription.create(payload);
            return res.http200({subscription});
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

  router.get("/of/associated/organization", asyncMiddleware(async (req: any, res: any) => {
    let filter: any = { organization: req.user.organization };
    if(req.query.isActive){
      filter.isActive = req.query.isActive
    }
    const subscriptions = await db.Subscription.find(filter);
    return res.http200({subscriptions});
    })
  );
};
