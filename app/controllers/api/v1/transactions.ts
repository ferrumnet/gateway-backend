module.exports = function (router: any) {
  router.get(
    "/list",
    asyncMiddleware(async (req: any, res: any) => {
      var filter = swapTransactionHelper.getFilters(req);
      let sort = { createdAt: -1 };
      let transactions = null;
      if (req.query.isPagination != null && req.query.isPagination == "false") {
        transactions = await db.SwapAndWithdrawTransactions.find(filter)
          .populate({
            path: "destinationNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .populate({
            path: "sourceNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .populate("sourceCabn")
          .populate("destinationCabn")
          .sort(sort);
      } else {
        transactions = await db.SwapAndWithdrawTransactions.find(filter)
          .populate({
            path: "destinationNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .populate({
            path: "sourceNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .populate("sourceCabn")
          .populate("destinationCabn")
          .sort(sort)
          .skip(req.query.offset ? parseInt(req.query.offset) : 0)
          .limit(req.query.limit ? parseInt(req.query.limit) : 10);
      }
      return res.http200({
        transactions: transactions,
      });
    })
  );
};
