
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var path = require('path');
var ejs = require("ejs");

module.exports = function (router) {

  router.get('/:id', async (req, res) => {

    let daysLeftToStart = 0
    let daysLeftToEnd = 0
    let minutesLeftToStart = 0
    let minutesLeftToEnd = 0
    let isStartToday = false

    let filter = {}
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

      if (leaderboard && user) {

        daysLeftToStart = global.helper.diffInDays(competition.startDate, new Date())
        daysLeftToEnd = global.helper.diffInDays(competition.endDate, new Date())

        minutesLeftToStart = global.helper.diffInMinuts(competition.startDate, new Date())
        minutesLeftToEnd = global.helper.diffInMinuts(competition.endDate, new Date())

        isStartToday = global.helper.isToday(competition.startDate)
        isEndToday = global.helper.isToday(competition.endDate)

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

  router.get('/by/leaderboard/:id', async (req, res) => {

    let competitionFilter = {}
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

  router.get("/participants/growth/:competition",asyncMiddleware(async (req, res) => {
    let excludedWalletAddress = req.query.withExcludedWalletAddress == "true" ? true : false 
    let filter = {competition: req.params.competition}
    let participants = []
    let sort = { rank: 1 }
    if(!excludedWalletAddress){
      filter.excludedWalletAddress = false
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

  router.get('/transactions/by/contractAddress/:contractAddress', asyncMiddleware(async (req, res) => {
    let filter = {contractAddress:req.params.contractAddress}
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
