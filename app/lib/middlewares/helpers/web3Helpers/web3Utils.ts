import Web3 from "web3";
import { abi as contractABI } from "../../../../../resources/FiberRouter.json";

export const getTransactionReceipt = async (
  txId: string,
  rpcURL: string
): Promise<any> => {
  let transaction: any = null;
  try {
    const web3 = new Web3(rpcURL);
    transaction = await web3.eth.getTransactionReceipt(txId);
    console.log("transaction", transaction?.status, txId);
  } catch (e) {
    console.log(e);
  }
  return transaction;
};

export const getTransactionByHash = async (
  txHash: string,
  rpcURL: string
): Promise<any> => {
  const web3 = new Web3(rpcURL);
  return await web3.eth.getTransaction(txHash);
};

export const getLogsFromTransactionReceipt = (data: any) => {
  let logDataAndTopic: any = undefined;

  if (data?.logs?.length) {
    for (const log of data.logs) {
      if (log?.topics?.length) {
        const topicIndex = findSwapEvent(log.topics, data);
        if (topicIndex !== undefined && topicIndex >= 0) {
          logDataAndTopic = {
            data: log.data,
            topics: log.topics,
          };
          break;
        }
      }
    }

    let swapEventInputs = contractABI.find(
      (abi) => abi.name === "Swap" && abi.type === "event"
    )?.inputs;

    if (data.isDestinationNonEVM != null && data.isDestinationNonEVM) {
      swapEventInputs = contractABI.find(
        (abi) => abi.name === "NonEvmSwap" && abi.type === "event"
      )?.inputs;
    }

    if (logDataAndTopic?.data && logDataAndTopic.topics) {
      const web3 = new Web3(data.rpcUrl);

      const decodedLog = web3.eth.abi.decodeLog(
        swapEventInputs as any,
        logDataAndTopic.data,
        logDataAndTopic.topics.slice(1)
      );

      return decodedLog;
    }
  }
};

const findSwapEvent = (topics: any[], data: any) => {
  let swapEventHash = Web3.utils.sha3(
    "Swap(address,address,uint256,uint256,uint256,address,address,uint256)"
  );
  if (data.isDestinationNonEVM != null && data.isDestinationNonEVM) {
    swapEventHash = Web3.utils.sha3(
      "NonEvmSwap(address,string,uint256,string,uint256,address,string,uint256)"
    );
  }

  if (topics?.length) {
    return topics.findIndex((topic) => topic === swapEventHash);
  } else {
    return undefined;
  }
};

export const isValidSwapTransaction = async (
  sourceNetwork: any,
  destinationNetwork: any,
  decodedDtata: any,
  txId: string
) => {
  if (sourceNetwork && destinationNetwork && decodedDtata) {
    let transaction = await getTransactionByHash(txId, sourceNetwork.rpcUrl);
    // if (
    //   transaction &&
    //   transaction.to &&
    //   sourceNetwork.multiSwapFiberRouterSmartContractAddress &&
    //   transaction.to.toLowerCase() ==
    //     sourceNetwork.multiSwapFiberRouterSmartContractAddress.toLowerCase()
    // ) {
    console.log("transaction", transaction?.to);
    return true;
    // }
  }
  return false;
};
