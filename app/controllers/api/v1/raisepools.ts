module.exports = function (router: any) {

  router.get('/list', async (req: any, res: any) => {

    var filter: any = {}
    var sort: any = { startDateTime: 1 }

    if(req.query.search){
      let reg = new RegExp(unescape(req.query.search), 'i');
      filter.nameInLower = reg
    }

    if(req.query.status){

      Object.keys(sort).forEach(key => {
        delete sort[key];
      })
      filter.status = req.query.status
      if(req.query.status == 'upcoming'){
        sort.startDateTime = 1
      }else if(req.query.status == 'open'){
        sort.endDateTime = 1
      }else if(req.query.status == 'closed'){
        sort.endDateTime = 1
      }
    }

    let raisePools = await db.RaisePools.find(filter)
      .sort(sort)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      raisePools: raisePools
    });

  });

  router.get('/:id', async (req: any, res: any) => {
    let filter = {}
    filter = { _id: req.params.id }

    let raisePool = await db.RaisePools.findOne(filter)

    return res.http200({
      raisePool: raisePool
    });

  });

};
