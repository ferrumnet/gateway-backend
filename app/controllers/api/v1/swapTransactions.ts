module.exports = function (router: any) {

  router.post('/:id', async (req: any, res: any) => {

    let network = await db.Networks.findOne({_id: req.body.network})
    return res.http200({
      transaction: await web3Helper.getTransactionUsingWeb3(network, req.params.id)
    })

  });

  router.post('/get/fees', async (req: any, res: any) => {

    let network = await db.Networks.findOne({_id: req.body.network})
    return res.http200({
      transaction: await web3Helper.getFeesUsingWeb3(network)
    })

  });
};
