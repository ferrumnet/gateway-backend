module.exports = {
  async cabnAssociationWithNetwork(req: any, res: any) {
    var filter = {network: req.params.id}
    return await db.CurrencyAddressesByNetwork.countDocuments(filter);
  },
  async dexAssociationWithNetwork(req: any, res: any) {
    var filter = {network: req.params.id}
    return await db.NetworkDexes.countDocuments(filter);
  },
}


