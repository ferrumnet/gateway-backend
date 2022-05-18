const { db, asyncMiddleware, commonFunctions, stringHelper } = global
var jwt = require('jsonwebtoken');

module.exports = function (router) {

  router.get('/menu', async (req, res) => {

    var matchMetatDataFilter = {}
    let metaDataAndFilter = []
    let sort = { 'menuPosition.communityMemberPosition': 1 }
    let filter = {}
    let organization = ''

    if (req.headers.authorization) {
      const decoded = jwt.verify(req.headers.authorization.split(' ')[1], global.environment.jwtSecret)
      req.user = await db.Users.findOne({ _id: decoded._id });
    }

    if (req.user && req.user.role == 'organizationAdmin') {
      organization = await db.Organizations.findOne({ _id: req.user.organization })
    } else {
      if (req.query.siteName) {
        organization = await db.Organizations.findOne({ siteName: req.query.siteName })
      }
    }

    if (req.user && req.user.role) {

      if (req.user.role == 'organizationAdmin') {
        metaDataAndFilter.push({'metaData':{'$elemMatch': { key: 'isOrganizationMemberMenuItem', value: 'true' } } })
        sort = { 'menuPosition.organizationAdminPosition': 1 }
      } else {
        metaDataAndFilter.push({'metaData':{'$elemMatch':{ key: 'isCommunityMemberMenuItem', value: 'true' } } })
      }

    } else {
      metaDataAndFilter.push({'metaData':{'$elemMatch':{ key: 'isCommunityMemberMenuItem', value: 'true' } } })
    }

    if (req.query.isForGateway) {
      if(req.query.isForGateway == 'true'){
        metaDataAndFilter.push({'metaData':{'$elemMatch':{ key: 'isForGateway', value: 'true' } } })
      }
    }

    let reg = new RegExp(unescape('#menuItem'), 'i');
    metaDataAndFilter.push({tags: reg})

    if (metaDataAndFilter && metaDataAndFilter.length > 0) {
      filter.$and = metaDataAndFilter
    }

    let products = await db.Product.find(filter)
      .sort(sort)

    await adjustMenuItems(products, req, organization)

    return res.http200({ menu: products });

  });

  async function adjustMenuItems(products, req, organization) {
    if (products && products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        let product = products[i]

        if (!req.user || req.user.role == 'communityMember') {
          if (product.menuItems && product.menuItems.length > 0) {
            let items = []
            for (let j = 0; j < product.menuItems.length; j++) {
              let item = product.menuItems[j]
              if (item && item.isDynamic && item.isDynamic == true) {
                items.push(item)
              }
            }
            product.menuItems = items
          }
        }

        if (product.tags && product.tags.includes('#leaderboards')) {
          product.menuItems.push(...await findLeaderboardsForMenu(product, organization, req))
        } else if (product.tags && product.tags.includes('#competitions')) {
          product.menuItems.push(...await findCompetitionsForMenu(product, organization, req))
        } if (product.tags && product.tags.includes('#currencies')) {
          product.menuItems.push(...await findCurrenciesForMenu(product, organization, req))
        }

      }
    }
  }

  async function findLeaderboardsForMenu(product, organization, req) {

    var items = []
    var filter = {}
    filter.organization = organization._id
    // if (!req.user && req.user.role != null && req.user.role == 'organizationAdmin') {
    // }else {
      filter.isVisibleForPublicMenuItem = true
    // }

    let data = await db.Leaderboards.find(filter)
      .sort({ createdAt: -1 })

    if (data && data.length > 0) {

      for (let i = 0; i < data.length; i++) {
        let item = data[i]
        let path = ''
        if(req.user){
          path = getItemFromMetaData(product, 'internalDynamicPathForSingle').value
        }else {
          path = getItemFromMetaData(product, 'internalPubDynamicPathForSingle').value
        }
        if (item.leaderboardCurrencyAddressesByNetwork.length > 1) {
          if(req.user){
            path = getItemFromMetaData(product, 'internalDynamicPathForMulti').value
          }else {
            path = getItemFromMetaData(product, 'internalPubDynamicPathForMulti').value
          }
        }
        items.push({ _id: item._id, name: item.name, isDynamic: true, count: item.leaderboardCurrencyAddressesByNetwork.length, path: path + item._id, icon: '' })
      }

    }
    return items
  }

  async function findCompetitionsForMenu(product, organization, req) {

    var items = []
    var filter = {}
    filter.organization = organization._id
    // if (!req.user && req.user.role && req.user.role == 'organizationAdmin') {
    // }else {
      filter.isVisibleForPublicMenuItem = true
    // }

    let data = await db.Competitions.find(filter)
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
      .sort({ createdAt: -1 })

    if (data && data.length > 0) {

      for (let i = 0; i < data.length; i++) {
        let item = data[i]
        let path = ''
        if(req.user){
          path = getItemFromMetaData(product, 'internalDynamicPathForSingle').value
        }else {
          path = getItemFromMetaData(product, 'internalPubDynamicPathForSingle').value
        }
        let icon = ''
        if (item && item.leaderboard && item.leaderboard.leaderboardCurrencyAddressesByNetwork
          && item.leaderboard.leaderboardCurrencyAddressesByNetwork.length > 0
          && item.leaderboard.leaderboardCurrencyAddressesByNetwork[0]
          && item.leaderboard.leaderboardCurrencyAddressesByNetwork[0].currencyAddressesByNetwork
          && item.leaderboard.leaderboardCurrencyAddressesByNetwork[0].currencyAddressesByNetwork.currency) {
          icon = item.leaderboard.leaderboardCurrencyAddressesByNetwork[0].currencyAddressesByNetwork.currency.logo
        }
        items.push({ _id: item._id, name: item.name, isDynamic: true, path: path + item._id, icon: icon })
      }

    }
    return items
  }

  async function findCurrenciesForMenu(product, organization, req) {

    var items = []
    var filter = {}
    filter.createdByOrganization = organization._id
    // if (!req.user && req.user.role && req.user.role == 'organizationAdmin') {
    // }else {
      filter.isVisibleForPublicMenuItem = true
    // }

    let data = await db.Currencies.find(filter).populate({
      path: 'currencyAddressesByNetwork',
      populate: {
        path: 'networkDex',
        populate: {
          path: 'dex',
          model: 'decentralizedExchanges'
        }
      }
    })
      .sort({ createdAt: -1 })

    if (data && data.length > 0) {

      for (let i = 0; i < data.length; i++) {
        let item = data[i]
        let path = ''
        let icon = item.logo
        items.push({ _id: item._id, name: item.name, isDynamic: true, icon: icon, currency: item, path: path })
      }

    }
    return items
  }

  function getItemFromMetaData(product, key) {

    let data = product.metaData
    if (data && data.length > 0) {

      for (let i = 0; i < data.length; i++) {
        let item = data[i]
        if (item && item.key && item.key == key) {
          return item
        }
      }
    }

    return { value: '' }
  }


};
