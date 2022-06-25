module.exports = function (router: any) {

  router.get('/:id', async (req: any, res: any) => {

    let daysLeftToStart = 0
    let daysLeftToEnd = 0
    let minutesLeftToStart = 0
    let minutesLeftToEnd = 0
    let isStartToday = false
    let isEndToday = false

    let filter: any = {}
    filter._id = req.params.id
    filter.$or = [
      { status: { $eq: 'published' } },
      { status: { $eq: 'started' } },
      { status: { $eq: 'completed' } }
    ]

    let competition = await db.Competitions.findOne(filter)

    if (competition && competition.user && competition.leaderboard && competition.startDate && competition.endDate) {

      let user = await db.Users.findOne({ _id: competition.user, isActive: true })
      let leaderboard = await db.Leaderboards.findOne({ _id: competition.leaderboard, isPublished: true, status: 'approved' })
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
        path: 'leaderboardCurrencyAddressesByNetwork',
        populate: {
          path: 'currencyAddressesByNetwork',
          populate: {
            path: 'currency',
            model: 'currencies'
          }
        }
      })

      if (leaderboard && user) {

        daysLeftToStart = (global as any).helper.diffInDays(competition.startDate, new Date())
        daysLeftToEnd = (global as any).helper.diffInDays(competition.endDate, new Date())

        minutesLeftToStart = (global as any).helper.diffInMinuts(competition.startDate, new Date())
        minutesLeftToEnd = (global as any).helper.diffInMinuts(competition.endDate, new Date())

        isStartToday = (global as any).helper.isToday(competition.startDate)
        isEndToday = (global as any).helper.isToday(competition.endDate)

        // if(competition.status == 'started' && !competition.startBlock){
        //   let jobId = await db.Jobs.findOne({competition: competition._id}).distinct('_id')
        //   global.commonFunctions.triggerAndSetTimeout(jobId)
        // }

        // if(competition.status == 'completed' && !competition.endBlock){
        //   let jobId = await db.Jobs.findOne({competition: competition._id}).distinct('_id')
        //   global.commonFunctions.triggerAndSetTimeout(jobId)
        // }

        return res.http200({
          isStartToday: isStartToday,
          isEndToday: isEndToday,
          minutesLeftToStart: minutesLeftToStart,
          minutesLeftToEnd: minutesLeftToEnd,
          daysLeftToStart: daysLeftToStart,
          daysLeftToEnd: daysLeftToEnd,
          competition: competition,
          leaderboard: leaderboard
        });
      }

    }
    return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorTheCompetitionIDIsIncorrectOrNotAvailable),stringHelper.strErrorTheCompetitionIDIsIncorrectOrNotAvailable);
  });

  router.get('/by/leaderboard/:id', async (req: any, res: any) => {

    let competitionFilter: any = {}
    let competitions = []
    let sort = { createdAt: -1 }

    competitionFilter.leaderboard = req.params.id
    if (req.query.isActive) {
      competitionFilter.isActive = req.query.isActive
    }

    competitionFilter.$or = [
      { status: { $eq: 'published' } },
      { status: { $eq: 'started' } },
    ]


    let leaderboard = await db.Leaderboards.findOne({ _id: req.params.id, isPublished: true, status: 'approved' }).populate('user')

    if (leaderboard && leaderboard.user && leaderboard.user.isActive) {
      if (req.query.isPagination != null && req.query.isPagination == 'false') {

        competitions = await db.Competitions.find(competitionFilter)
          .sort(sort)

      } else {
        competitions = await db.Competitions.find(competitionFilter)
          .sort(sort)
          .skip(req.query.offset ? parseInt(req.query.offset) : 0)
          .limit(req.query.limit ? parseInt(req.query.limit) : 10)
      }
    }

    return res.http200({
      competitions: competitions
    });

  });

  router.get("/participants/growth/:competition",asyncMiddleware(async (req: any, res: any) => {
    let excludedWalletAddress = req.query.withExcludedWalletAddress == "true" ? true : false
    let filter: any = {competition: req.params.competition}
    let participants = []
    let sort = { rank: 1 }
    if(!excludedWalletAddress){
      filter.excludedWalletAddress = { $in: [false, null] }
    }
    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      participants = await db.CompetitionGrowthTracker.find(filter).sort(sort)
    } else {
      participants = await db.CompetitionGrowthTracker.find(filter).sort(sort)
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }
    return res.http200({ participants });
    })
  )

  router.get('/transactions/by/contractAddress/:contractAddress', asyncMiddleware(async (req: any, res: any) => {
    let filter: any = {contractAddress:req.params.contractAddress}
    let transactions = []
    let sort = { rank: 1 }

    if(req.query.fromBlock || req.query.toBlock){
      filter.blockNumber = {}
      if(req.query.fromBlock){
        filter.blockNumber.$gt = req.query.fromBlock
      }
      if(req.query.toBlock){
        filter.blockNumber.$lt = req.query.toBlock
      }
    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      transactions = await db.CompetitionTransactionsSnapshots.find(filter).sort(sort)
    } else {
      transactions = await db.CompetitionTransactionsSnapshots.find(filter).sort(sort)
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }
    return res.http200({ transactions });
    }))

};
