module.exports = function (router: any) {
  router.get("/by/sitename/:siteName", async (req: any, res: any) => {
    let filter = {};
    filter = { siteName: req.params.siteName };

    let organizationId = await db.Organizations.findOne(filter).distinct("_id");
    let organizationWhiteLables = await db.OrganizationWhiteLables.findOne({
      createdByOrganization: organizationId,
    }).populate({
      path: 'crucibleConfig.baseCurrency.cabn',
      populate: {
        path: 'currency',
        populate: {
          path: 'currency',
          model: 'currencies'
        }
      }
    }).populate('crucibleConfig.crucibleFarms.cabn')

    return res.http200({
      organizationWhiteLables: organizationWhiteLables,
    });
  });

  router.get("/by/type/:type", async (req: any, res: any) => {
    let filter = {};
    filter = { type: req.params.type };

    let organizationWhiteLables = await db.OrganizationWhiteLables.findOne(
      filter
    );

    return res.http200({
      organizationWhiteLables: organizationWhiteLables,
    });
  });

  router.get('/menu/by/sitename/:siteName', async (req: any, res: any) => {

    let metaDataAndFilter = []
    let sort: any = { 'menuPosition.communityMemberPosition': 1 }
    let filter: any = {}
    let organization: any;
    let isFromOrganizationAdminPath = false;

    if (!req.params.siteName) {
      return res.http400("siteName is required.");
    }

    organization = await db.Organizations.findOne({ siteName: req.params.siteName })

    if (!organization) {
      return res.http400("Invalid siteName");
    }
    
    metaDataAndFilter.push({ 'metaData': { '$elemMatch': { key: 'isCommunityMemberMenuItem', value: 'true' } } })

    if (req.query.isForGateway) {
      if(req.query.isForGateway == 'true'){
        metaDataAndFilter.push({'metaData':{'$elemMatch':{ key: 'isForGateway', value: 'true' } } })
      }
    }

    if (req.query.isForCrucible) {
      if(req.query.isForCrucible == 'true'){
        metaDataAndFilter.push({'metaData':{'$elemMatch':{ key: 'isForCrucible', value: 'true' } } })
      }
    }

    let reg = new RegExp(unescape('#menuItem'), 'i');
    metaDataAndFilter.push({tags: reg})

    if (metaDataAndFilter && metaDataAndFilter.length > 0) {
      filter.$and = metaDataAndFilter
    }

    let packageIds = await db.Subscription.find({ organization: organization._id }).distinct('package');
    let productIds = await db.Package.find({ _id: {$in: packageIds} }).distinct('product');

    filter._id = {$in: productIds}
    let products = await db.Product.find(filter)
      .sort(sort)

    await adjustMenuItems(products, req, organization, isFromOrganizationAdminPath)

    return res.http200({ menu: products });

  });

  async function adjustMenuItems(products: any, req: any, organization: any, isFromOrganizationAdminPath: boolean) {
    if (products && products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        let product = products[i]

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
    filter.isVisibleForPublicMenuItem = true
    
    let data = await db.Leaderboards.find(filter)
      .sort({ createdAt: 1 })
      
    if (data && data.length > 0) {

      for (let i = 0; i < data.length; i++) {
        let item = data[i]
        let path = ''
        path = getItemFromMetaData(product, 'internalPubDynamicPathForSingle').value
        
        if(item.type && item.type == 'stake'){
          path = getItemFromMetaData(product, 'internalPubDynamicPathForStake').value
        }else if (item.leaderboardCurrencyAddressesByNetwork.length > 1) {
          path = getItemFromMetaData(product, 'internalPubDynamicPathForMulti').value
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
    filter.isVisibleForPublicMenuItem = true

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
        path = getItemFromMetaData(product, 'internalPubDynamicPathForSingle').value
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
    filter.isVisibleForPublicMenuItem = true
    
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
