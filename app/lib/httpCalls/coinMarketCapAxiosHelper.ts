import axios from "axios";

export async function getCMCQuote(symbol: string) {
  const BASE_URL = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}`;
  let headers = {
    "X-CMC_PRO_API_KEY": (global as any as any).environment.cmcApiKey,
    "Accept-Encoding": "application/json",
  };
  let res = await axios.get(BASE_URL, { headers: headers });
  return filterResponse(res?.data?.data)?.quote?.USD?.price;
}

const filterResponse = (data: any) => {
  try {
    if (data) {
      for (var key in data) {
        if (data[key]) {
          return data[key][0];
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
