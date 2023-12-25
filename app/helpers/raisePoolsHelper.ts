module.exports = {

  async isAlreadyPledged(req: any, res: any) {
    return new Promise(async(resolve, reject) => {
      let count = await db.PledgeRaisePools.count({raisePoolId: req.params.id, pledgedUserId: req.user._id})
      if(count > 0){
        reject(stringHelper.strErrorAlreadyPledged);
      }else {
        resolve(count);
      }
    });
  },
}
