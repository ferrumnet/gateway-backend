const { db } = global;

module.exports = {
 async activeCurrenciesDetailsByOrg(orgId) {
    const matchFilter = { createdByOrganization: orgId, isActive: true };
    let filter = [
        { '$match': matchFilter}, 
        {'$lookup': {'from': 'currencyAddressesByNetwork', 'localField': 'currencyAddressesByNetwork', 'foreignField': '_id','as': 'cabn' }},
        {'$unwind': {'path': '$cabn','preserveNullAndEmptyArrays': true}}, 
        {'$match': {'cabn.isActive': true}},
        {'$lookup': {'from': 'networks', 'localField': 'cabn.network', 'foreignField': '_id', 'as': 'cabn.network'}}, 
        {'$unwind': {'path': '$cabn.network', 'preserveNullAndEmptyArrays': true}},
        {'$match': {'cabn.network.isActive': true }},
        {'$lookup': {'from': 'networkDexes','localField': 'cabn.networkDex','foreignField': '_id','as': 'cabn.networkDex'}}, 
        {'$unwind': {'path': '$cabn.networkDex', 'preserveNullAndEmptyArrays': true }}, 
        {'$match': {'cabn.networkDex.isActive': true}},
        {'$lookup': {'from': 'decentralizedExchanges', 'localField': 'cabn.networkDex.dex', 'foreignField': '_id', 'as': 'cabn.networkDex.dex' }}, 
        {'$unwind': {'path': '$cabn.networkDex.dex', 'preserveNullAndEmptyArrays': true }}, 
        {'$match': {'cabn.networkDex.dex.isActive': true}}, 
        {'$project': {
            '_id': 1, 
            'name': 1, 
            'symbol': 1, 
            'logo': 1, 
            'isActive': 1, 
            'cabn._id': 1, 
            'cabn.isActive': 1, 
            'cabn.tokenContractAddress': 1, 
            'cabn.networkDex._id': 1, 
            'cabn.networkDex.isActive': 1,
            'cabn.networkDex.dex._id': 1,  
            'cabn.networkDex.dex.url': 1, 
            'cabn.networkDex.dex.isActive': 1, 
            'cabn.network._id': 1, 
            'cabn.network.isActive': 1
          }
        }
      ];
    const currencies = await db.Currencies.aggregate(filter);
    return currencies;
  },

  async activeLeaderBoardsByUser(userId){
    const matchfilter = { user: userId, isPublished: true, status: "approved" };
    let filter = [
      {'$match': matchfilter}, 
      {
        '$project': {           
          '_id': 1, 
          'name':1,
          numberOfCurrencies: { $cond: { if: { $isArray: "$leaderboardCurrencyAddressesByNetwork" }, then: { $size: "$leaderboardCurrencyAddressesByNetwork" }, else: "NA"} }     
        }    
      }
    ]
    const leaderboards = await db.Leaderboards.aggregate(filter);
    return leaderboards;
  },

  async activeCompitionsByLeaderboard(leaderboards) {
    const leaderboardsIds = leaderboards.map((leaderboard) => leaderboard._id);
    filter = {
      leaderboard: { $in: leaderboardsIds },
      status: "published",
      isActive: true,
    };
    return await db.Competitions.find(filter).select("_id name leaderboard");
  },

  async subscriptionWithProduct(organizationId) {
    const matchFilter = { organization: organizationId, isActive: true };
    const filter =[
      { '$match': matchFilter}, 
      {'$lookup': {'from': 'packages', 'localField': 'package', 'foreignField': '_id','as': 'package' }},
      {'$unwind': {'path': '$package','preserveNullAndEmptyArrays': true}}, 
      {'$match': {'package.isActive': true}},
      {'$lookup': {'from': 'products', 'localField': 'package.product', 'foreignField': '_id','as': 'product' }},
      {'$unwind': {'path': '$product','preserveNullAndEmptyArrays': true}}, 
      {'$match': {'product.isActive': true}},
      {'$project': {
        '_id': 1, 
        'actualLimit': 1, 
        'usedLimit': 1, 
        'isActive': 1, 
        'organization': 1, 
        'package._id': 1, 
        'createdByUser': 1, 
        'product._id': 1, 
        'product.nameInLower': 1, 
        'product.isActive': 1,
        }
      }
    ]
    return await db.Subscription.aggregate(filter);
  },
};
