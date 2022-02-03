
const { db, asyncMiddleware, commonFunctions } = global
const mailer = global.mailer;
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var path = require('path');
var ejs = require("ejs");

module.exports = function (router) {

  router.get('/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    let organization = await db.Organizations.findOne(filter)

    return res.http200({
      organization: organization
    });

  });

  router.get('/currencyAddressbyNetwork/list', async (req, res) => {

    var currencyAddressesByNetwork = []
    var filter = {}
    filter.organization = req.user.organization

    if (req.query.isPagination != null && req.query.isPagination == 'false') {

      currencyAddressesByNetwork = await db.CurrencyAddressesByNetwork.find(filter).populate('network').populate('currency').populate({
        path: 'networkDex',
        populate: {
          path: 'dex',
          model: 'decentralizedExchanges'
        }
      })
        .sort({ createdAt: -1 })

    } else {

      currencyAddressesByNetwork = await db.CurrencyAddressesByNetwork.find(filter).populate('network').populate('currency').populate({
        path: 'networkDex',
        populate: {
          path: 'dex',
          model: 'decentralizedExchanges'
        }
      })
        .sort({ createdAt: -1 })
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    }

    return res.http200({
      currencyAddressesByNetwork: currencyAddressesByNetwork
    });
  });

};
