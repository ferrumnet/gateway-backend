const { db, asyncMiddleware, commonFunctions, stringHelper } = global

module.exports = function (router) {
    
    router.get('/by/ferrum/identifier/:identifier', async (req, res) => {

        var filter =  { ferrumNetworkIdentifier: req.params.identifier }   
        let network = await db.Networks.findOne(filter)         
        return network ? res.http200({ network }) : res.http404('Network not found') 
    
      });
};