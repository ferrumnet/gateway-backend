module.exports = {

  async isEventAssociatedWithUser(organizationId: any, eventId: any){
    const filter = { organization: organizationId, _id: eventId}
    console.log(await db.TokenHolderBalanceSnapshotEvents.countDocuments(filter))
    return await db.TokenHolderBalanceSnapshotEvents.countDocuments(filter)
  }

}
