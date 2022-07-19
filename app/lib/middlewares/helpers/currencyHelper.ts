module.exports = {
  async createCurrencyAddresses(req: any, model: any, body: any) {

    let results = []
    if (model && body.networks && body.networks.length > 0) {
      for (let i = 0; i < body.networks.length; i++) {
        let organization = ''
        if (body.networks[i].tokenContractAddress) {
          body.networks[i].tokenContractAddress = (body.networks[i].tokenContractAddress).toLowerCase()
        }
        if(req.user && req.user.organization){
          organization = req.user.organization
        }else {
          organization = req.body.organization
        }
        let innerBody = {
          network: body.networks[i].network,
          currency: model._id,
          networkDex: body.networks[i].networkDex,
          tokenContractAddress: body.networks[i].tokenContractAddress,
          createdByOrganization: organization
        }
        let result = await db.CurrencyAddressesByNetwork.create(innerBody)
        results.push(result._id)
        // let count = await db.CurrencyAddressesByNetwork.count({ network: body.networks[i].network, currency: model._id })
        // if (count == 0) {
        // }
      }
    }

    return results
  },
  async currencyAssociationWithNetwork(req: any, res: any) {
    var filter = {networkCurrencyAddressByNetwork: req.params.id}
    return await db.Networks.countDocuments(filter);
  },
  async currencyAssociationWithLeaderboardssss(req: any, res: any) {
    var filter = {networkCurrencyAddressByNetwork: req.params.id}
    return await db.LeaderboardCurrencyAddressesByNetwork.countDocuments(filter);
  },
  async currencyAssociationWithLeaderboard(req: any, res: any) {
    var filter = {currency: req.params.id}
    var cabnIds =  await db.CurrencyAddressesByNetwork.find(filter).distinct('_id')
    return await db.LeaderboardCurrencyAddressesByNetwork.countDocuments({currencyAddressesByNetwork: {$in: cabnIds}});
  },
  async currencyAssociationWithTokenHoldersBalanceSnapshots(req: any, res: any) {
    var filter = {currency: req.params.id}
    var cabnIds =  await db.CurrencyAddressesByNetwork.find(filter).distinct('_id')
    return await db.TokenHoldersBalanceSnapshots.countDocuments({currencyAddressesByNetwork: {$in: cabnIds}});
  },
}
