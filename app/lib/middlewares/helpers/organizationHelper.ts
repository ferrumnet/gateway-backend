module.exports = {

  async getOrganizationsCountById(req: any){
    let organization = req.user.organization
    if(req.body.organization){
        organization = req.body.organization
    }
    const filter = { _id: organization, isActive: true }
    return await db.Organizations.countDocuments(filter)
  }

}
