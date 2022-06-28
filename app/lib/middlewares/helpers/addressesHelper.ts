var mongoose = require('mongoose');

module.exports = {

  async genrateNonceByABN(req: any, res: any, address: any, network: any) {
    let resAddress = {}
    req.body.createdAt = new Date()
    req.body.address = (req.body.address).toLowerCase()
    let nonce = Math.floor(100000 + Math.random() * 900000)
    req.body.nonce = nonce

    if(address._id){
      let updateBody: any = {nonce: req.body.nonce}
      updateBody.updatedAt = new Date()
      updateBody.nonce = req.body.nonce
      resAddress = await db.Addresses.findOneAndUpdate({ _id: address._id }, updateBody, { new: true })
    }else {
      if(network){
        req.body.network = network._id
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
  async getAddress(req: any, res: any, isFromUniqueAndAuthenticated = false){
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
    filterAndList.push({'network.ferrumNetworkIdentifier': ferrumNetworkIdentifier })

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
  }
}
