var axios = require("axios").default;

export const postMultiswapAlertIntoChannel = async (body: any) => {
  try {
    const url = (global as any as any).environment
      .slackMultiswapAlertNotificationUrl;
    let config = {
      headers: {
        Authorization: "",
      },
    };
    let res = await axios.post(`${url}`, body, config);
    console.log("res.data", res.data);
    return res.data;
  } catch (error: any) {
    console.log(error.data);
  }
  return null;
};
