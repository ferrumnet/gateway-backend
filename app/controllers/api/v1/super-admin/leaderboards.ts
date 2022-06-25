module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    if (!req.body.name || !req.body.currencyAddressesByNetwork || !req.body.organization) {
      return res.http400('name & currencyAddressesByNetwork & organization are required.');
    }

    if (req.body.currencyAddressesByNetwork && req.body.currencyAddressesByNetwork.length == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorCurrencyAddressesByNetworkMustContainValue),stringHelper.strErrorCurrencyAddressesByNetworkMustContainValue,);
    }

    req.body.exclusionWalletAddressList = leaderboardHelper.convertListIntoLowercase(req.body.exclusionWalletAddressList)
    req.body.user = req.user._id
    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.organization = req.body.organization
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    if(!req.body.type){
      req.body.type = 'other'
    }

    let leaderboard = await db.Leaderboards.create(req.body)
    leaderboard.leaderboardCurrencyAddressesByNetwork = await leaderboardHelper.createLeaderboardCurrencyAddressesByNetwork(req.body, leaderboard)
    leaderboard.leaderboardStakingContractAddresses = await leaderboardHelper.createLeaderboardStakingContractAddresses(req.body, leaderboard)

    leaderboard = await db.Leaderboards.findOneAndUpdate({ _id: leaderboard }, leaderboard, { new: true }).populate({
      path: 'leaderboardCurrencyAddressesByNetwork',
      populate: {
        path: 'currencyAddressesByNetwork',
        model: 'currencyAddressesByNetwork'
      }
    })

    leaderboardHelper.fetchTokenHolders(leaderboard.leaderboardCurrencyAddressesByNetwork)

    res.http200({
      leaderboard: leaderboard
    });

  });

  router.put('/update/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.currencyAddressesByNetwork || !req.body.organization) {
      return res.http400('name & currencyAddressesByNetwork & organization are required.');
    }

    if (req.body.currencyAddressesByNetwork && req.body.currencyAddressesByNetwork.length == 0) {
      delete req.body.currencyAddressesByNetwork
    }

    req.body.exclusionWalletAddressList = leaderboardHelper.convertListIntoLowercase(req.body.exclusionWalletAddressList)
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    let leaderboard = await db.Leaderboards.findOneAndUpdate(filter, req.body, { new: true });

    res.http200({
      leaderboard: leaderboard
    });

  });

  router.get('/list', async (req: any, res: any) => {

    var filter = {}
    let leaderboards = []
    let sort = { createdAt: -1 }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {

      leaderboards = await db.Leaderboards.find(filter)
      .populate({
        path: 'leaderboardCurrencyAddressesByNetwork',
        populate: {
          path: 'currencyAddressesByNetwork',
          populate: {
            path: 'network',
            model: 'networks'
          }
        }
      })
      .populate({
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
      })
      .sort(sort)

    }else {

      leaderboards = await db.Leaderboards.find(filter)
      .populate({
        path: 'leaderboardCurrencyAddressesByNetwork',
        populate: {
          path: 'currencyAddressesByNetwork',
          populate: {
            path: 'network',
            model: 'networks'
          }
        }
      })
      .populate({
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
      })
      .sort(sort)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    }


      return res.http200({
        leaderboards: leaderboards
      });

  });

  router.get('/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    let leaderboard = await db.Leaderboards.findOne(filter)
      .populate({
        path: 'leaderboardCurrencyAddressesByNetwork',
        populate: {
          path: 'currencyAddressesByNetwork',
          populate: {
            path: 'network',
            model: 'networks'
          }
        }
      })
      .populate({
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
      })
      .populate({
        path: 'customCurrencyAddressesByNetwork',
        populate: {
          path: 'to.currencyAddressesByNetwork',
          populate: {
            path: 'currency',
            model: 'currencies'
          }
        }
      })
      .populate({
        path: 'customCurrencyAddressesByNetwork',
        populate: {
          path: 'from.currencyAddressesByNetwork',
          populate: {
            path: 'currency',
            model: 'currencies'
          }
        }
      })

    return res.http200({
      leaderboard: leaderboard,
    });

  });

  router.put('/active/inactive/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    let leaderboard = await db.Leaderboards.findOne(filter)
    if(leaderboard){
      leaderboard.isActive = !leaderboard.isActive
    }

    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    leaderboard = await db.Leaderboards.findOneAndUpdate(filter, leaderboard, { new: true })

    return res.http200({
      leaderboard: leaderboard
    });

  });

};
