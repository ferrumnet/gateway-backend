const subscriptionHelper = require("../../../lib/middlewares/helpers/subscriptionHelper");

module.exports = function (router: any) {
  router.get("/details/of/organization/by/sitename/:name",asyncMiddleware(async (req: any, res: any) => {
      let filter: any = { siteName: req.params.name, isActive: true };
      let organization = null,
        subscriptions = [],
        currencies = []
     
      if (filter.siteName) {
        organization = await db.Organizations.findOne(filter);
        if (organization) {
          filter = { _id: organization.user, isActive: true };
          const user = await db.Users.findOne(filter);
          if (user) {
            currencies = await subscriptionHelper.activeCurrenciesDetailsByOrg(organization._id)
            subscriptions = await subscriptionHelper.subscriptionWithProduct(organization._id);       
            const subscribedProducts = subscriptions.map((subscription: any) => subscription.product.nameInLower)            
           
            const LBSIndex =   subscribedProducts.indexOf("leaderboard")  
            if (LBSIndex > -1) {              
              const  LBSPName = subscriptions[LBSIndex].product.name;     
              subscriptions[LBSIndex][LBSPName] = await subscriptionHelper.activeLeaderBoardsByUser(user._id);
              const CSIndex = subscribedProducts.indexOf("competition")
              if (subscriptions[LBSIndex][LBSPName].length > 0 && CSIndex > -1) {
                const CSPName = subscriptions[CSIndex].product.name; 
                subscriptions[CSIndex][CSPName] = await subscriptionHelper.activeCompitionsByLeaderboard(subscriptions[LBSIndex][LBSPName]);
              }
            }
            return res.http200({organization, subscriptions, currencies});
          }
          return res.http404("user not found");
        }
        return res.http404("Organization not found");
      }
      return res.http403("Site name required");
    })
  );
};
