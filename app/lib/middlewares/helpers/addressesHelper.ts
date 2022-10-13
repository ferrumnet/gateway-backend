var mongoose = require('mongoose');
var jwt = require("jsonwebtoken");

module.exports = {

  async genrateNonceByABN(req: any, res: any, address: any, network: any) {
    let resAddress = {}
    req.body.createdAt = new Date()
    req.body.address = (req.body.address).toLowerCase()
    let nonce = Math.floor(100000 + Math.random() * 900000)
    req.body.nonce = nonce

    if(address._id && address.network && network && address.network.ferrumNetworkIdentifier == network.ferrumNetworkIdentifier){
      let updateBody: any = {nonce: req.body.nonce}
      updateBody.updatedAt = new Date()
      updateBody.nonce = req.body.nonce
      resAddress = await db.Addresses.findOneAndUpdate({ _id: address._id }, updateBody, { new: true })
    }else {
      if(network){
        req.body.network = network._id
      }
      if(address && address.user){
        req.body.user = address.user;
      }
      resAddress = await db.Addresses.create(req.body);
    }
    return resAddress
  },
  async createUserByABN(req: any, res: any, address: any) {
    let response: any = {}
    let userbody: any = {}
    let updateAddressBody: any = {}
    let user: any = {}

    if(!address.user){
      userbody.createdAt = new Date()
      let addresses = []
      addresses.push(address._id)
      userbody.addresses = addresses
      userbody.email = null
      userbody.role = req.body.role
      user = await db.Users.create(userbody);
    }else {
      user._id = address.user
      let userWithAddressCount = await db.Users.count({_id:user._id, addresses: {$in: address._id}});
      if(userWithAddressCount == 0){
        let userForUpdateAddresses = await db.Users.findOne({_id:user._id});
        if(userForUpdateAddresses){
          let addresses = userForUpdateAddresses.addresses;
          addresses.push(address._id);
          userForUpdateAddresses.addresses = addresses;
          userForUpdateAddresses.updatedAt = new Date();
          await db.Users.findOneAndUpdate({_id: user._id}, userForUpdateAddresses);
        }
      }
    }

    let status = {isAddressAuthenticated: true, updatedAt: new Date()}
    updateAddressBody.user = user._id
    updateAddressBody.status = status
    updateAddressBody.nonce = ''
    let updatedAddress = await db.Addresses.findOneAndUpdate({_id: address._id}, updateAddressBody, { new: true })

    user = await db.Users.findOne({_id: user._id }).populate('addresses','address network').populate({
      path: 'addresses',
      select: { '_id': 1, 'address':1, 'network': 1},
      populate: {
        path: 'network',
        model: 'networks'
      }
    }
    )
    response.user = user.toClientObject()
    response.token = user.createAPIToken(user)
    return response
  },
  async getAddress(req: any, res: any, isFromUniqueAndAuthenticated = false, isWithoutferrumNetworkIdentifier = false){
    let sort = { createdAt: -1 }
    var matchFilter: any = {}
    var filterAndList= []
    var filter = []
    let ferrumNetworkIdentifier = ''
    let address = ''

    if(req.query.ferrumNetworkIdentifier){
      ferrumNetworkIdentifier = req.query.ferrumNetworkIdentifier
    }else {
      ferrumNetworkIdentifier = req.body.ferrumNetworkIdentifier
    }

    if(req.query.address){
      address = req.query.address
    }else {
      address = req.body.address
    }

    if(isFromUniqueAndAuthenticated){
      if(req.query.userId){
        filterAndList.push({ user: new mongoose.Types.ObjectId(req.query.userId) })
      }
      filterAndList.push({'status.isAddressAuthenticated': true })
    }

    filterAndList.push({address: (address).toLowerCase()})
    if(!isWithoutferrumNetworkIdentifier){
      filterAndList.push({'network.ferrumNetworkIdentifier': ferrumNetworkIdentifier })
    }

    if(filterAndList && filterAndList.length > 0){
      matchFilter.$and = []
      matchFilter.$and.push({$and: filterAndList})
    }

    filter = [
      { $lookup: { from: 'networks', localField: 'network', foreignField: '_id', as: 'network' } },
      { $unwind: { "path": "$network","preserveNullAndEmptyArrays": true}},
      { $match: matchFilter },
      { $sort: sort },
    ];

    let response = await db.Addresses.aggregate(filter);

    return response
  },
  async checkForOrganizationAdmin(model: any){
    let user = model.user;
    if(user && !user.organization){
      model.token = this.createAPITokenForConnectWallet(user)
      model.user = {}
      return model
    }else if(user && user.approvalStatusAsOrganizationAdminBySuperAdmin){
      if(user.approvalStatusAsOrganizationAdminBySuperAdmin == 'approved'){
        return model;
      }else if(user.approvalStatusAsOrganizationAdminBySuperAdmin == 'pending'){
        return {message: await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorApprovalIsOnPending)}
      }else if(user.approvalStatusAsOrganizationAdminBySuperAdmin == 'declined'){
        return {message: await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorApprovalIsOnDeclined)}
      }
    }

    return user;
  },createAPITokenForConnectWallet(payload: any) {
    return jwt.sign(
      { id: payload._id},
      (global as any).environment.jwtSecret
    );
  }
}
