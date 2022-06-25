module.exports = function (router: any) {

  router.get('/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    let organization = await db.Organizations.findOne(filter)

    return res.http200({
      organization: organization
    });

  });

  router.get('/currencyAddressbyNetwork/list', async (req: any, res: any) => {

    var currencyAddressesByNetwork = []
    var filter: any = {}
    filter.organization = req.user.organization

    if (req.query.isPagination != null && req.query.isPagination == 'false') {

      currencyAddressesByNetwork = await db.CurrencyAddressesByNetwork.find(filter).populate('network').populate('currency').populate({
        path: 'networkDex',
        populate: {
          path: 'dex',
          model: 'decentralizedExchanges'
        }
      })
        .sort({ createdAt: -1 })

    } else {

      currencyAddressesByNetwork = await db.CurrencyAddressesByNetwork.find(filter).populate('network').populate('currency').populate({
        path: 'networkDex',
        populate: {
          path: 'dex',
          model: 'decentralizedExchanges'
        }
      })
        .sort({ createdAt: -1 })
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    }

    return res.http200({
      currencyAddressesByNetwork: currencyAddressesByNetwork
    });
  });

};
