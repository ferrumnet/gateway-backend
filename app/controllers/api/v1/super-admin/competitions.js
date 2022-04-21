
const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper} = global
const mailer = global.mailer;
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var path = require('path');
var ejs = require("ejs");

module.exports = function (router) {

  router.get('/list', async (req, res) => {

    var filter = {}
    let competitions = []
    let sort = { createdAt: -1 }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {

      competitions = await db.Competitions.find(filter)
      .sort(sort)

    }else {

      competitions = await db.Competitions.find(filter)
      .sort(sort)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    }

    return res.http200({
      competitions: competitions
    });

  });

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

    return res.http200({
      competition: competition
    });

  });

  router.put('/active/inactive/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    let competition = await db.Competitions.findOne(filter)
    if(competition){
      competition.isActive = !competition.isActive
    }

    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    competition = await db.Competitions.findOneAndUpdate(filter, competition, { new: true })

    return res.http200({
      competition: competition
    });

  });

};
