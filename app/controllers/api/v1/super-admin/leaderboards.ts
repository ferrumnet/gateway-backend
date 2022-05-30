module.exports = function (router: any) {

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
