module.exports = function (router: any) {

  router.get('/', async (req: any, res: any) => {

    return res.http200({
      message: 'success'
    });

  });

  router.get('/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id, isPublished: true, status: 'approved' }

    let leaderboard = await db.Leaderboards.findOne(filter).populate('user').populate({
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
      path: 'leaderboardCurrencyAddressesByNetwork',
      populate: {
        path: 'currencyAddressesByNetwork',
        populate: {
          path: 'currency',
          model: 'currencies'
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

    if(leaderboard && leaderboard.user){
      let user = await db.Users.findOne({_id: leaderboard.user, isActive: true})
      if(user){
        return res.http200({
          leaderboard: leaderboard
        });
      }

    }
    return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorTheLeaderboardIDIsIncorrectOrNotAvailable),stringHelper.strErrorTheLeaderboardIDIsIncorrectOrNotAvailable,);

  });



};
