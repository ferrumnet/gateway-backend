const { db, asyncMiddleware, commonFunctions, stringHelper } = global

module.exports = function (router) {
    
    router.get('/allow/on/gateway/:identifier', async (req, res) => {

        const identifierCond =  { ferrumNetworkIdentifier: req.params.identifier }   
        const allowedCond =  { isAllowedOnGateway: true }   
        let status = false
        let networks = await db.Networks.find({
            $or: [
                identifierCond,
                allowedCond
            ]
        })
        const index = networks.findIndex(network => network.ferrumNetworkIdentifier == req.params.identifier )
        if(index > -1) {
            status = networks[index].isAllowedOnGateway
            if(!status) networks.splice(index,1)
        } 
        return res.http200({ status, networks }) 
      });
};