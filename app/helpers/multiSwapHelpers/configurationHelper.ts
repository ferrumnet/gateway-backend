let db = require("../../models/index");

export const getOneInchExcludedProtocols = async (): Promise<any> => {
  let data = await db.Configurations.findOne();
  let protocols: any = data?.oneInchExcludedProtocols
    ? data?.oneInchExcludedProtocols
    : [];
  if (protocols) {
    protocols = protocols.join(",");
  } else {
    protocols = "";
  }
  return protocols ? protocols : "";
};
