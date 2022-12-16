module.exports = function (router: any) {

  router.get('/:walletAddress', async (req: any, res: any) => {
    let isAllowed = false;
    let filter = {}
    filter = { walletAddress: req.params.walletAddress };

    let count = await db.WalletAddressWhiteList.countDocuments(filter)
    if(count > 0){
      isAllowed = true;
    }
    return res.http200({
      isAllowed: isAllowed
    });

  });
};
