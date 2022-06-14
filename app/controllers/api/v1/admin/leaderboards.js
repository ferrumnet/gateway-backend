
const { db, asyncMiddleware, commonFunctions, stringHelper, bscScanTokenHolders } = global
const mailer = global.mailer;
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var path = require('path');
var ejs = require("ejs");
const { findTokenHolders } = require('../../../../lib/httpCalls/findTokenHolders');

module.exports = function (router) {

  router.post('/create', async (req, res) => {

    if (!req.body.name || !req.body.currencyAddressesByNetwork) {
      return res.http400('name & currencyAddressesByNetwork are required.');
    }

    if (req.body.currencyAddressesByNetwork && req.body.currencyAddressesByNetwork.length == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorCurrencyAddressesByNetworkMustContainValue),stringHelper.strErrorCurrencyAddressesByNetworkMustContainValue,);
    }

    let leaderboardsCount = await db.Leaderboards.count({ user: req.user._id });

    if (leaderboardsCount > 20) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorLeaderboardCreateLimit),stringHelper.strErrorLeaderboardCreateLimit,);
    }

    req.body.exclusionWalletAddressList = convertListIntoLowercase(req.body.exclusionWalletAddressList)
    req.body.user = req.user._id
    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.organization = req.user.organization
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    let leaderboard = await db.Leaderboards.create(req.body)
    leaderboard.leaderboardCurrencyAddressesByNetwork = await createLeaderboardCurrencyAddressesByNetwork(req.body, leaderboard)
    leaderboard = await db.Leaderboards.findOneAndUpdate({ _id: leaderboard }, leaderboard, { new: true }).populate({
      path: 'leaderboardCurrencyAddressesByNetwork',
      populate: {
        path: 'currencyAddressesByNetwork',
        model: 'currencyAddressesByNetwork'
      }
    })

    fetchTokenHolders(leaderboard.leaderboardCurrencyAddressesByNetwork)

    res.http200({
      leaderboard: leaderboard
    });

  });

  router.put('/update/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.currencyAddressesByNetwork) {
      return res.http400('name & currencyAddressesByNetwork are required.');
    }

    if (req.body.currencyAddressesByNetwork && req.body.currencyAddressesByNetwork.length == 0) {
      delete req.body.currencyAddressesByNetwork
    }

    req.body.exclusionWalletAddressList = convertListIntoLowercase(req.body.exclusionWalletAddressList)
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    let leaderboard = await db.Leaderboards.findOneAndUpdate(filter, req.body, { new: true });

    res.http200({
      leaderboard: leaderboard
    });

  });

  router.put('/update/status/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.status) {
      return res.http400('status is required.');
    }

    let leaderboard = await db.Leaderboards.findOneAndUpdate(filter, { status: req.body.status, updatedAt: new Date(), updatedByUser : req.user._id }, { new: true });

    res.http200({
      leaderboard: leaderboard
    });

  });

  router.get('/list', async (req, res) => {

    var filter = {}
    filter.organization = req.user.organization

    db.Leaderboards.find(filter)
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
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
      .then((leaderboards) => {
        res.http200({
          leaderboards: leaderboards
        });
      })

  });

  router.get('/:id', async (req, res) => {

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
        path: 'leaderboardCurrencyAddressesByNetwork',
        populate: {
          path: 'currencyAddressesByNetwork',
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

  function convertListIntoLowercase(list) {

    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        if (list[i]) {
          list[i] = list[i].toLowerCase()
        }
      }
    }

    return list
  }

  async function createLeaderboardCurrencyAddressesByNetwork(body, model) {

    let results = []
    if (model && body.currencyAddressesByNetwork && body.currencyAddressesByNetwork.length > 0) {
      for (let i = 0; i < body.currencyAddressesByNetwork.length; i++) {
        let count = await db.LeaderboardCurrencyAddressesByNetwork.count({ network: body.currencyAddressesByNetwork[i], leaderboard: model._id })
        if (count == 0) {

          let innerBody = {
            currencyAddressesByNetwork: body.currencyAddressesByNetwork[i],
            leaderboard: model._id
          }

          let result = await db.LeaderboardCurrencyAddressesByNetwork.create(innerBody)
          results.push(result._id)
        }
      }
    }

    return results
  }

  function fetchTokenHolders(list) {

    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        bscScanTokenHolders.findTokenHolders(list[i].currencyAddressesByNetwork)
      }
    }
  }

};
