const { db, asyncMiddleware, commonFunctions, stringHelper} = global

module.exports = {
  async createCurrencyAddresses(req, model, body) {

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
  }
}
