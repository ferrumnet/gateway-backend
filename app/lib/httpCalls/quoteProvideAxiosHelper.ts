import axios from "axios";
let stringHelper = require("../../helpers/stringHelper");

export const oneInchSwap = async (
  walletAddress: string,
  chainId: string,
  src: string,
  dst: string,
  amount: string,
  from: string,
  receiver: string,
  slippage: string,
  excludedProtocols: []
) => {
  try {
    let config = {
      headers: {
        Authorization: `Bearer ${
          (global as any as any).environment.OneInchApiKey
        }`,
      },
    };
    let url = `https://api.1inch.dev/swap/v6.0/${chainId}/swap?src=${src}&dst=${dst}&amount=${amount}&from=${from}&slippage=${slippage}&disableEstimate=true&includeProtocols=true&allowPartialFill=true&receiver=${receiver}&compatibility=true&excludedProtocols=${excludedProtocols}&origin=${walletAddress}`;
    console.log("url", url);
    let res = await axios.get(url, config);
    return res?.data;
  } catch (error: any) {
    console.log("1Inch error status", error?.response?.status);
    console.log("1Inch error statusText", error?.response?.statusText);
    if (
      error?.response?.status &&
      error?.response?.statusText.toLowerCase() ==
        stringHelper.strErrorInsufficientLiquidity.toLowerCase()
    ) {
      throw stringHelper.strErrorInsufficientLiquidity;
    } else {
      throw stringHelper.strErrorGenericProvider;
    }
  }
};
