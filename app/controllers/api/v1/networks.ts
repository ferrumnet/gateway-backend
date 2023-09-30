module.exports = function (router: any) {
  // This end point needs to be retired
  router.get("/", async (req: any, res: any) => {
    var filter = { ferrumNetworkIdentifier: req.query.ferrumNetworkIdentifier };
    let network = await db.Networks.findOne(filter)
      .populate({
        path: "networkCurrencyAddressByNetwork",
        populate: {
          path: "currency",
          model: "currencies",
        },
      })
      .populate({
        path: "networkCurrencyAddressByNetwork",
        populate: {
          path: "networkDex",
          populate: {
            path: "dex",
            model: "decentralizedExchanges",
          },
        },
      });
    return network
      ? res.http200({ network })
      : res.http400(
          await commonFunctions.getValueFromStringsPhrase(
            stringHelper.strErrorNetwrokNotFound
          ),
          stringHelper.strErrorNetwrokNotFound
        );
  });

  router.get("/list", async (req: any, res: any) => {
    var filter: any = {};
    let networks = [];
    var sort: any = { createdAt: -1 };
    let multiswapNetworkFIBERInformation = "temp";

    if (req.query.sortKey) {
      Object.keys(sort).forEach((key) => {
        delete sort[key];
      });
      sort = { [req.query.sortKey]: parseInt(req.query.sortOrder) };
    }

    if (req.query.isAllowedOnMultiSwap) {
      if (req.query.isAllowedOnMultiSwap == "true") {
        filter.isAllowedOnMultiSwap = true;
      } else {
        filter.isAllowedOnMultiSwap = false;
      }
    }

    if (req.query.isAllowedOnGateway) {
      if (req.query.isAllowedOnGateway == "true") {
        filter.isAllowedOnGateway = true;
      } else {
        filter.isAllowedOnGateway = false;
      }
    }

    if (req.query.isActive) {
      if (req.query.isActive == "true") {
        filter.isActive = true;
      } else {
        filter.isActive = false;
      }
    }

    if (req.query.isNonEVM) {
      if (req.query.isNonEVM == "true") {
        filter.isNonEVM = true;
      } else {
        filter.isNonEVM = false;
      }
    }

    if (
      req.query.allowFIBERData &&
      req.query.allowFIBERData == (global as any).environment.apiKeyForGateway
    ) {
      multiswapNetworkFIBERInformation = "multiswapNetworkFIBERInformation";
    }

    if (req.query.isPagination != null && req.query.isPagination == "false") {
      networks = await db.Networks.find(filter)
        .populate("parentId")
        .populate(multiswapNetworkFIBERInformation)
        .sort(sort);
    } else {
      networks = await db.Networks.find(filter)
        .populate("parentId")
        .populate(multiswapNetworkFIBERInformation)
        .sort(sort)
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10);
    }

    return res.http200({
      networks: networks,
    });
  });

  router.get("/:id", async (req: any, res: any) => {
    var filter: any = {};

    filter.$or = [
      { ferrumNetworkIdentifier: req.params.id },
      { chainId: req.params.id },
      // { _id: req.params.id }
    ];
    let network = await db.Networks.findOne(filter)
      .populate({
        path: "networkCurrencyAddressByNetwork",
        populate: {
          path: "currency",
          model: "currencies",
        },
      })
      .populate({
        path: "networkCurrencyAddressByNetwork",
        populate: {
          path: "networkDex",
          populate: {
            path: "dex",
            model: "decentralizedExchanges",
          },
        },
      });

    if (!network) {
      network = await getNetworkByNetworkId(network, req);
    }

    return network
      ? res.http200({ network })
      : res.http400(
          await commonFunctions.getValueFromStringsPhrase(
            stringHelper.strErrorNetwrokNotFound
          ),
          stringHelper.strErrorNetwrokNotFound
        );
  });

  async function getNetworkByNetworkId(network: any, req: any) {
    try {
      network = await db.Networks.findOne({ _id: req.params.id })
        .populate({
          path: "networkCurrencyAddressByNetwork",
          populate: {
            path: "currency",
            model: "currencies",
          },
        })
        .populate({
          path: "networkCurrencyAddressByNetwork",
          populate: {
            path: "networkDex",
            populate: {
              path: "dex",
              model: "decentralizedExchanges",
            },
          },
        });

      return network;
    } catch (e: any) {
      console.log(e);
    }
  }
};
