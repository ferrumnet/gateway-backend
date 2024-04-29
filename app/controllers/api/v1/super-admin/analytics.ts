var mongoose = require("mongoose");
import moment from "moment";
var uab = require("unique-array-objects");

module.exports = function (router: any) {
  // this is a rough script (which created quickly)
  router.get("/", async (req: any, res: any) => {
    try {
      let totalMinutes = 0;
      let totalSeconds = 0;
      let totalUSDCVolume = 0;
      let sourceWalletAddress: any = [];
      let filters: any = {
        version: "v3",
      };
      if (req.query.status) {
        filters.status = { $gte: req.query.status };
      }
      if (req.query.dateTime) {
        filters.createdAt = { $gte: req.query.dateTime };
      }

      let transactions = await db.SwapAndWithdrawTransactions.find(filters)
        .populate("sourceCabn")
        .populate("sourceNetwork");
      for (let item of transactions || []) {
        let dt1 = moment(item.createdAt).utc();
        let dt2 = moment(item.updatedAt).utc();
        var resultInSeconds = dt2.diff(dt1, "seconds");
        if (resultInSeconds > 60) {
          resultInSeconds = 60;
        }
        totalSeconds = totalSeconds + resultInSeconds;
        console.log(
          "resultInSeconds",
          resultInSeconds,
          item?.receiveTransactionId
        );
        sourceWalletAddress.push(item?.sourceWalletAddress);
      }
      let avgTimeInSeconds = totalSeconds / transactions.length;
      console.log("===============================");
      console.log("Avg time in seconds: ", avgTimeInSeconds);
      console.log("Total transactions: ", transactions.length);
      console.log("Total volume (USDC): ", totalUSDCVolume * 2);
      if (sourceWalletAddress && sourceWalletAddress.length > 0) {
        console.log(
          "Number of unique source wallet addresses: ",
          await uab(sourceWalletAddress).length
        );
      }
      await getVolumePerNetwork(filters);
      console.log("===============================");
      return res.http200({ message: "" });
    } catch (e) {
      console.log(e);
    }
  });
};

async function getSettledAmount(item: any) {
  let settledAmount = 0;
  try {
    settledAmount = await (global as any).swapUtilsHelper.amountToHuman_(
      item.sourceNetwork,
      item.sourceCabn,
      item.settledAmount
    );
  } catch (e) {
    settledAmount = await (global as any).swapUtilsHelper.amountToHuman(
      item.settledAmount,
      item.sourceCabn.decimals
    );
  }
  return settledAmount;
}

async function getVolumePerNetwork(filters: any) {
  let data: any = [];
  let networks = await db.Networks.find({ isAllowedOnMultiSwap: true });
  console.log("Total networks", networks.length);
  let grandTotalUSDCVolume = 0;

  for (let item of networks || []) {
    let innerFilters = { ...filters };
    innerFilters.sourceNetwork = item?._id;
    let transactions = await db.SwapAndWithdrawTransactions.find(innerFilters)
      .populate("sourceCabn")
      .populate("sourceNetwork");
    let totalUSDCVolume = 0;
    for (let tx of transactions || []) {
      if (tx.settledAmount) {
        let settledAmount = await getSettledAmount(tx);
        if (settledAmount) {
          totalUSDCVolume = totalUSDCVolume + Number(settledAmount);
        }
      }
    }
    let network: any = {};
    network.networkName = item?.name;
    network.networkChainId = item?.chainId;
    network.totalVolumeInUSDC = totalUSDCVolume * 2;
    data.push(network);
    grandTotalUSDCVolume = grandTotalUSDCVolume + totalUSDCVolume;
  }
  console.log("USDC Volume per network: ", data);
  console.log("Total USDC Volume: ", grandTotalUSDCVolume * 2);
  return data;
}
