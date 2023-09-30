module.exports = {
  async dexAssociationWithCABNs(req: any, res: any) {
    var filter = {dex: req.params.id}
    var networkDexIds =  await db.NetworkDexes.find(filter).distinct('_id')
    return await db.CurrencyAddressesByNetwork.countDocuments({networkDex: {$in: networkDexIds}});
  },
}


