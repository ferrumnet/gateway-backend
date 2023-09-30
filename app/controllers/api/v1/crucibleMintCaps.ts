module.exports = function (router: any) {

  router.get('/last', async (req: any, res: any) => {
    let filter = {}
    filter = { _id: req.params.id }

    let crucibleMintCap = await db.CrucibleMintCaps.findOne()
      .sort({ createdAt: -1 })

    return res.http200({
      crucibleMintCap: crucibleMintCap
    });

  });

};
