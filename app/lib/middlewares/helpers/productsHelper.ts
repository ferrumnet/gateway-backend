module.exports = {
  async productAssociationWithPackages(req: any, res: any) {
    var filter = {product: req.params.id}
    return await db.Package.countDocuments(filter);
  },
}


