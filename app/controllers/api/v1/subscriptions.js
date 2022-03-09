const { asyncMiddleware } = global;
const subscriptionHelper = require("../../../lib/middlewares/helpers/subscriptionHelper");

module.exports = function (router) {
  router.get("/details/of/organization/by/sitename/:name",asyncMiddleware(async (req, res) => {
      let filter = { siteName: req.params.name, isActive: true };
      let organization = null,
        subscriptions = [],
        leaderboards = [],
        currencies = [],
        Competitions = [];
      if (filter.siteName) {
        organization = await db.Organizations.findOne(filter);
        if (organization) {
          filter = { _id: organization.user, isActive: true };
          const user = await db.Users.findOne(filter);
          if (user) {
            subscriptions = await subscriptionHelper.subscriptionWithProduct(organization._id);       
            const subscribedProducts = subscriptions.map((subscription) => subscription.product.nameInLower)         
            currencies = await subscriptionHelper.activeCurrenciesDetailsByOrg(organization._id)
           
            if (subscribedProducts.indexOf("leaderboard") > -1) {
              leaderboards = await subscriptionHelper.activeLeaderBoardsByUser(user._id);

              if (leaderboards.length > 0 && subscribedProducts.indexOf("compition") > -1) {
                Competitions = await subscriptionHelper.activeCompitionsByLeaderboard( leaderboards);
              }

            }
            return res.http200({organization, subscriptions, leaderboards, Competitions, currencies});
          }
          return res.http404("user not found");
        }
        return res.http404("Organization not found");
      }
      return res.http403("Site name required");
    })
  );
};
