const { db, asyncMiddleware, commonFunctions, stringHelper, crucibleAprsHelper } = global
var mongoose , {isValidObjectId} = require('mongoose');
const Web3= require("web3")

module.exports = function (router) {

  router.get('/calculate', async (req, res) => {
    crucibleAprsHelper.crucibleAutoCalculateApr(req, res)
  });

};
