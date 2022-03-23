const { asyncMiddleware, commonFunctions, utils, db, leaderboardHelper, organizationHelper } = global;

module.exports = function (router) {

  router.post("/create", asyncMiddleware(async (req, res) => {

    if (!req.body.type || !req.body.triggeredSnapshotDateTime || !req.body.leaderboard) {
      return res.http400('type, triggeredSnapshotDateTime and leaderboard are required');
    }

    if (await organizationHelper.getOrganizationsCountById(req) == 0) {
      return res.http404('organization not found')
    }

    if (await leaderboardHelper.getLeaderboardsCountById(req) == 0) {
      return res.http404('leaderboard not found')
    }

    req.body.organization = req.user.organization
    req.body.createdByUser = req.user._id
    req.body.actualSnapshotDateTime = null
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    const tokenHolderBalanceSnapshotEvent = await db.TokenHolderBalanceSnapshotEvents.create(req.body);
    return res.http200({
      tokenHolderBalanceSnapshotEvent: tokenHolderBalanceSnapshotEvent
    });

  }));

  router.get("/list", asyncMiddleware(async (req, res) => {

    let tokenHolderBalanceSnapshotEvents = [];
    let sort = { createdAt: -1 }
    let filter = { organization: req.user.organization }

    if (req.query.isActive) {
      filter.isActive = req.query.isActive
    }

    if (req.query.type) {
      filter.type = req.query.type
    }

    if (req.query.status) {
      filter.status = req.query.status
    }

    if (req.query.fromDate && req.query.toDate) {
      filter.triggeredSnapshotDateTime = { $gte: req.query.fromDate, $lte: req.query.toDate }
    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      tokenHolderBalanceSnapshotEvents = await db.TokenHolderBalanceSnapshotEvents.find(filter)
        .sort(sort)
    } else {
      tokenHolderBalanceSnapshotEvents = await db.TokenHolderBalanceSnapshotEvents.find(filter)
        .sort(sort)
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }

    return res.http200({
      tokenHolderBalanceSnapshotEvents: tokenHolderBalanceSnapshotEvents
    })
  }));

  router.get('/:id', asyncMiddleware(async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id }

    const tokenHolderBalanceSnapshotEvent = await db.TokenHolderBalanceSnapshotEvents.findOne(filter)
      .populate('organization')
      .populate({
        path: 'leaderboard',
        populate: {
          path: 'leaderboardCurrencyAddressesByNetwork',
          populate: {
            path: 'currencyAddressesByNetwork',
            populate: {
              path: 'network',
              model: 'networks'
            }
          }
        }
      })
      .populate({
        path: 'leaderboard',
        populate: {
          path: 'leaderboardCurrencyAddressesByNetwork',
          populate: {
            path: 'currencyAddressesByNetwork',
            populate: {
              path: 'networkDex',
              populate: {
                path: 'dex',
                model: 'decentralizedExchanges'
              }
            }
          }
        }
      })

    return res.http200({
      tokenHolderBalanceSnapshotEvent: tokenHolderBalanceSnapshotEvent
    });

  }));
};
