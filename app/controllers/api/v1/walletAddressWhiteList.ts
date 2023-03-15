module.exports = function (router: any) {

  router.get('/:walletAddress', async (req: any, res: any) => {
    let isAllowed = false;
    let filter: any = {}
    filter = { walletAddress: req.params.walletAddress };

    if(req.query.type){
      filter.type = req.query.type;
    }

    let count = await db.WalletAddressWhiteList.countDocuments(filter)
    if(count > 0){
      isAllowed = true;
    }
    return res.http200({
      isAllowed: isAllowed
    });

  });
};
