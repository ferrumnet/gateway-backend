var snapshotskeys = ['_id', 'tokenHolderAddress', 'tokenHolderQuantity', 'currentBlock', 'currencyAddressesByNetwork']

module.exports = function (router: any) {

  router.get("/list/:siteName", asyncMiddleware(async (req: any, res: any) => {

    let tokenHolderBalanceSnapshotEvents = [];
    let sort = { createdAt: -1 }
    let organizationId = await db.Organizations.findOne({siteName: req.params.siteName}).distinct('_id')
    let filter = { organization: organizationId }

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

  router.get('/:siteName/:id', asyncMiddleware(async (req: any, res: any) => {
    let filter = {}
    let organizationId = await db.Organizations.findOne({siteName: req.params.siteName}).distinct('_id')
    filter = { _id: req.params.id,organization: organizationId  }

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

  router.get("/snapshot/list/:tokenHolderEventId", asyncMiddleware(async (req: any, res: any) => {

    let tokenHoldersBalanceSnapshots = [];
    let sort = { createdAt: 1 }
    let filter: any = {}

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
};
