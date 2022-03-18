const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(err => {
      try{

        if (err.message) {
          err = err.message
        } else if (err.msg) {
          err = err.msg
        }else if(err && err.errors && err.errors.type && err.errors.type.properties  && err.errors.type.properties.message){
          err = err.errors.type.properties.message
        } else if (err.errors) {
          _.forEach(err.errors, (error, key) => {
           errors.push(error.message)
         })
            err = errors[0]
        }

        res.http400(err)
      }catch(e){
        res.http400(e)
      }
    })
}

module.exports = asyncMiddleware
