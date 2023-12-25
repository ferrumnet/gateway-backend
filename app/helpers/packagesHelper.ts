module.exports = {
  async packageAssociationWithSubscription(req: any, res: any) {
    var filter = {product: req.params.id}
    return await db.Package.countDocuments(filter);
  },
}


