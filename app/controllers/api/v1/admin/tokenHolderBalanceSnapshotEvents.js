const { asyncMiddleware, commonFunctions, utils, db, leaderboardHelper, organizationHelper, timeoutHelper, tokenHolderBalanceSnapshotEventHelper, stringHelper } = global;
let snapshotskeys = ['_id', 'tokenHolderAddress', 'tokenHolderQuantity', 'currentBlock', 'currencyAddressesByNetwork']

module.exports = function (router) {

  router.post("/create", asyncMiddleware(async (req, res) => {

    if (!req.body.type || !req.body.triggeredSnapshotDateTime || !req.body.leaderboard) {
      return res.http400('type, triggeredSnapshotDateTime and leaderboard are required');
    }

    if (await organizationHelper.getOrganizationsCountById(req) == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNotFoundOrganization), stringHelper.strErrorNotFoundOrganization,);
    }

    if (await leaderboardHelper.getLeaderboardsCountById(req) == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorTheLeaderboardIDIsIncorrectOrNotAvailable), stringHelper.strErrorTheLeaderboardIDIsIncorrectOrNotAvailable,);
    }

    req.body.organization = req.user.organization
    req.body.createdByUser = req.user._id
    req.body.actualSnapshotDateTime = null
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    const tokenHolderBalanceSnapshotEvent = await db.TokenHolderBalanceSnapshotEvents.create(req.body)
    timeoutHelper.setSnapshotEventsTimeout(tokenHolderBalanceSnapshotEvent)
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

  router.get("/snapshot/associated/organization/list/:tokenHolderEventId", asyncMiddleware(async (req, res) => {

    let tokenHoldersBalanceSnapshots = [];
    let sort = { createdAt: 1 }
    let filter = {}

    if (await tokenHolderBalanceSnapshotEventHelper.isEventAssociatedWithUser(req.user.organization, req.params.tokenHolderEventId) == 0) {
      return res.http200({
        tokenHoldersBalanceSnapshots: tokenHoldersBalanceSnapshots
      })
    }

    filter.tokenHolderBalanceSnapshotEvent = req.params.tokenHolderEventId
    if (req.query.cabnId) {
      filter.currencyAddressesByNetwork = req.query.cabnId
    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      tokenHoldersBalanceSnapshots = await db.TokenHoldersBalanceSnapshots.find(filter, snapshotskeys)
    } else {
      tokenHoldersBalanceSnapshots = await db.TokenHoldersBalanceSnapshots.find(filter, snapshotskeys)
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }

    return res.http200({
      tokenHoldersBalanceSnapshots: tokenHoldersBalanceSnapshots
    })
  }));

  router.get("/snapshot/list/:tokenHolderEventId", asyncMiddleware(async (req, res) => {

    let tokenHoldersBalanceSnapshots = [];
    let sort = { createdAt: 1 }
    let filter = {}

    filter.tokenHolderBalanceSnapshotEvent = req.params.tokenHolderEventId
    if (req.query.cabnId) {
      filter.currencyAddressesByNetwork = req.query.cabnId
    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      tokenHoldersBalanceSnapshots = await db.TokenHoldersBalanceSnapshots.find(filter, snapshotskeys)
    } else {
      tokenHoldersBalanceSnapshots = await db.TokenHoldersBalanceSnapshots.find(filter, snapshotskeys)
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }

    return res.http200({
      tokenHoldersBalanceSnapshots: tokenHoldersBalanceSnapshots
    })
  }));

  router.delete('/:id', asyncMiddleware(async (req, res) => {
    let filter = {}

    await db.TokenHoldersBalanceSnapshots.remove({ tokenHolderBalanceSnapshotEvent: req.params.id })
    await db.TokenHolderBalanceSnapshotEvents.remove({ _id: req.params.id })

    return res.http200({
      message: stringHelper.strSuccess
    });
  }))

};
