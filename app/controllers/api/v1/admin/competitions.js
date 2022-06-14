
const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper} = global
const mailer = global.mailer;
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var path = require('path');
var ejs = require("ejs");

module.exports = function (router) {

  router.post('/create', asyncMiddleware(async (req, res) => {

    if (!req.body.name || !req.body.leaderboard || !req.body.startDate || !req.body.endDate) {
      return res.http400('name & leaderboard & startDate & endDate are required.');
    }
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.startDateAfterDelay = moment(req.body.startDate).utc().add(10,'seconds')
    req.body.endDateAfterDelay = moment(req.body.endDate).utc().add(10,'seconds')
    req.body.user = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.organization = req.user.organization
    // delete req.body.startBlock
    // delete req.body.endBlock

    let competitionsCount = await db.Competitions.count({ user: req.user._id });

    if (competitionsCount > 2) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorCreateCompetitionsLimit),stringHelper.strErrorCreateCompetitionsLimit,);
    }

    req.body.createdAt = new Date()

    let competition = await db.Competitions.create(req.body)
    // let jobBody = {type: 'competition', competition: competition._id, status: stringHelper.tagStartBlock}
    // let createBody = await db.Jobs.create(jobBody)
    // commonFunctions.triggerAndSetTimeout(createBody._id)
    return res.http200({
      competition: competition
    });

  }));

  router.put('/update/:id', asyncMiddleware(async (req, res) => {
    let isDateChanged = false
    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name) {
      return res.http400('name is required.');
    }
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()
    req.body.startDateAfterDelay = moment(req.body.startDate).utc().add(10,'seconds')
    req.body.endDateAfterDelay = moment(req.body.endDate).utc().add(10,'seconds')

    let oldCompetition = await db.Competitions.findOne(filter)
    if(oldCompetition){
      let oldStartDateAfterDelay = moment(oldCompetition.startDateAfterDelay).utc()
      let oldEndDateAfterDelay= moment(oldCompetition.endDateAfterDelay).utc()

      if(oldStartDateAfterDelay.isSame(req.body.startDateAfterDelay)
      && oldEndDateAfterDelay.isSame(req.body.endDateAfterDelay)){}else {
        isDateChanged = true
      }
    }

    let competition = await db.Competitions.findOneAndUpdate(filter, req.body, { new: true,runValidators: true })
    // if(isDateChanged){
    //   await db.Jobs.remove({ competition: competition._id })
    //   let jobBody = {type: 'competition', competition: competition._id, status: stringHelper.tagStartBlock}
    //   let createBody = await db.Jobs.create(jobBody)
    //   commonFunctions.triggerAndSetTimeout(createBody._id)
    // }
    return res.http200({
      competition: competition
    });

  }));

  router.put('/update/status/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.status) {
      return res.http400('status is required.');
    }

    let competition = await db.Competitions.findOneAndUpdate(filter, {status: req.body.status, updatedAt:  new Date(), updatedByUser : req.user._id}, { new: true });

    res.http200({
      competition: competition
    });

  });

  router.get('/list', async (req, res) => {

    var filter = {}
    filter.organization = req.user.organization

    db.Competitions.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
      .then((competitions) => {
        res.http200({
          competitions: competitions
        });
      })

  });

  router.get("/participants/growth/:competition",asyncMiddleware(async (req, res) => {
    let filter = {competition: req.params.competition}
    let participants = []
    let sort = { rank: 1 }
    if(req.query.excludedWalletAddress){
       filter.excludedWalletAddress = req.query.excludedWalletAddress == "true" ? true : false
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

  router.get('/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    let competition = await db.Competitions.findOne(filter)
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
    .populate({
      path: 'leaderboard',
      populate: {
        path: 'leaderboardCurrencyAddressesByNetwork',
        populate: {
          path: 'currencyAddressesByNetwork',
          populate: {
            path: 'currency',
            model: 'currencies'
          }
        }
      }
    })

    return res.http200({
      competition: competition
    });

  });

};
