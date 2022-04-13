
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = function (router) {

  // router.get('/1', async (req, res) => {
  //   let filter = {}
  //   filter = {}

  //   let data = await db.Leaderboards.find()
  //   if(data && data.length > 0){
  //     for(let i=0; i<data.length; i++){
  //       let item = data[i]
  //       console.log(data[i].user)
  //       let user = await db.Users.findOne({_id: item.user})
  //       if(user){
  //         item.createdByUser = user._id
  //         item.updatedByUser = user._id
  //         item.organization = user.organization
  //         await db.Leaderboards.findOneAndUpdate({_id: item._id}, item, { new: true })
  //       }
  //     }
  //   }
  //   let resData = await db.Leaderboards.find()
  //   return res.http200({
  //     data: resData
  //   });

  // });

};
