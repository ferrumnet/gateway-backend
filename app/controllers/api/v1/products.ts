var jwt = require("jsonwebtoken");

module.exports = function (router: any) {

  router.get('/menu', async (req: any, res: any) => {

    var matchMetatDataFilter = {}
    let metaDataAndFilter = []
    let sort: any = { 'menuPosition.communityMemberPosition': 1 }
    let filter: any = {}
    let organization = ''
    let isFromOrganizationAdminPath = false;

    if (req.headers.authorization) {
      const decoded = jwt.verify(req.headers.authorization.split(' ')[1], (global as any).environment.jwtSecret)
      req.user = await db.Users.findOne({ _id: decoded._id });
    }

    if(req.query.isFromOrganizationAdminPath && req.query.isFromOrganizationAdminPath == 'true'){
      isFromOrganizationAdminPath = true;
    }

    if (req.user && req.user.role == 'organizationAdmin' && isFromOrganizationAdminPath) {
      organization = await db.Organizations.findOne({ _id: req.user.organization })
    } else {
      if (req.query.siteName) {
        organization = await db.Organizations.findOne({ siteName: req.query.siteName })
      }
    }

    if (req.user && req.user.role) {

      if (req.user.role == 'organizationAdmin' && isFromOrganizationAdminPath) {
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

    await adjustMenuItems(products, req, organization, isFromOrganizationAdminPath)

    return res.http200({ menu: products });

  });

  async function adjustMenuItems(products: any, req: any, organization: any, isFromOrganizationAdminPath: boolean) {
    if (products && products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        let product = products[i]

        if (!req.user || req.user.role == 'communityMember' || !isFromOrganizationAdminPath) {
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
          product.menuItems.push(...await findLeaderboardsForMenu(product, organization, req, isFromOrganizationAdminPath))
        } else if (product.tags && product.tags.includes('#competitions')) {
          product.menuItems.push(...await findCompetitionsForMenu(product, organization, req, isFromOrganizationAdminPath))
        } if (product.tags && product.tags.includes('#currencies')) {
          product.menuItems.push(...await findCurrenciesForMenu(product, organization, req, isFromOrganizationAdminPath))
        }

      }
    }
  }

  async function findLeaderboardsForMenu(product: any, organization: any, req: any, isFromOrganizationAdminPath: boolean) {

    var items = []
    var filter: any = {}
    filter.organization = organization._id
    if (req.user && req.user.role != null && req.user.role == 'organizationAdmin' && isFromOrganizationAdminPath) {
    }else {
      filter.isVisibleForPublicMenuItem = true
    }
    
    let data = await db.Leaderboards.find(filter)
      .sort({ createdAt: 1 })
      
    if (data && data.length > 0) {

      for (let i = 0; i < data.length; i++) {
        let item = data[i]
        let path = ''
        if(req.user && req.user.role && req.user.role == 'organizationAdmin' && isFromOrganizationAdminPath){
          path = getItemFromMetaData(product, 'internalDynamicPathForSingle').value
        }else {
          path = getItemFromMetaData(product, 'internalPubDynamicPathForSingle').value
        }
        if(item.type && item.type == 'stake'){
          if(req.user && req.user.role && req.user.role == 'organizationAdmin' && isFromOrganizationAdminPath){
            path = getItemFromMetaData(product, 'internalDynamicPathForStake').value
          }else {
            path = getItemFromMetaData(product, 'internalPubDynamicPathForStake').value
          }
        }else if (item.leaderboardCurrencyAddressesByNetwork.length > 1) {
          if(req.user && req.user.role && req.user.role == 'organizationAdmin' && isFromOrganizationAdminPath){
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

  async function findCompetitionsForMenu(product: any, organization: any, req: any, isFromOrganizationAdminPath: boolean) {

    var items = []
    var filter: any = {}
    filter.organization = organization._id
    if (req.user && req.user.role && req.user.role == 'organizationAdmin' && isFromOrganizationAdminPath) {
    }else {
      filter.isVisibleForPublicMenuItem = true
    }

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
      .sort({ createdAt: 1 })

    if (data && data.length > 0) {

      for (let i = 0; i < data.length; i++) {
        let item = data[i]
        let path = ''
        if(req.user && req.user.role && req.user.role == 'organizationAdmin' && isFromOrganizationAdminPath){
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

  async function findCurrenciesForMenu(product: any, organization: any, req: any, isFromOrganizationAdminPath: boolean) {

    var items = []
    var filter: any = {}
    filter.createdByOrganization = organization._id
    if (req.user && req.user.role && req.user.role == 'organizationAdmin' && isFromOrganizationAdminPath) {
    }else {
      filter.isVisibleForPublicMenuItem = true
    }
    
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
      .sort({ createdAt: 1 })

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

  function getItemFromMetaData(product: any, key: any) {

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
