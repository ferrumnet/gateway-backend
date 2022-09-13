module.exports = {
  async createSmartCurrencyAddressesByNetwork(req: any, model: any, body: any) {

    let results = []
    if (model && body.scabn && body.scabn.length > 0) {
      for (let i = 0; i < body.scabn.length; i++) {
        let organization = ''
        if (body.scabn[i].smartContractAddress) {
          body.scabn[i].smartContractAddress = (body.scabn[i].smartContractAddress).toLowerCase()
        }
        organization = req.body.organization

        let innerBody = {
          network: body.scabn[i].network,
          smartContract: model._id,
          smartContractAddress: body.scabn[i].smartContractAddress,
          createdByOrganization: organization
        }
        console.log(innerBody);
        let result = await db.SmartCurrencyAddressesByNetwork.create(innerBody)
        results.push(result._id)
      }
    }

    return results
  }
}
