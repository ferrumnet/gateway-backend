module.exports = {

  async signOut(req: any, res: any) {
    if(req.body && req.body.log){
      await logsHelper.createLog(req, res, true)
    }
    return res.http200({
      message: stringHelper.strSuccess
    });
  },
}


