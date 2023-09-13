module.exports = {
  async getNodeUrl(type: string) {
    let filter: any = { type: type };
    let data = await db.NodeConfigurations.findOne(filter);
    if (data && data.createJobUrl) {
      return data.createJobUrl;
    }
    return null;
  },
  async getValidatorNodeUrls() {
    let filter: any = { type: utils.nodeTypes.validator };
    let urls: any = [];
    let data = await db.NodeConfigurations.find(filter);
    if (data && data.length > 0) {
      for (let item of data) {
        if (item.createJobUrl) {
          urls.push(item.createJobUrl);
        }
      }
    }
    return urls;
  },
};
