module.exports = function (router: any) {

  router.get('/allow/on/gateway', async (req: any, res: any) => {
    let filter: any = { $or: [] }
    let status = false

    if(!req.query.ferrumNetworkIdentifier){
      return res.http400('ferrumNetworkIdentifier is required')
    }

    filter.$or.push({ ferrumNetworkIdentifier: req.query.ferrumNetworkIdentifier })
    filter.$or.push({ isAllowedOnGateway: true })

    let networks = await db.Networks.find(filter)
    const index = networks.findIndex((network: any) => network.ferrumNetworkIdentifier == req.query.ferrumNetworkIdentifier)
    if (index > -1) {
      status = networks[index].isAllowedOnGateway
      if (!status) networks.splice(index, 1)
    }
    return res.http200({ status, networks })
  });
};
