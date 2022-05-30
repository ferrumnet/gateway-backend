
declare const db: any,
asyncMiddleware: any,
commonFunctions: any,
stringHelper: any
// timeoutHelper any

const utils = {

  increaseTimeOutCount() {
    // if(!this.count){
    //   this.count = 0
    // }
    // this.count += 1;
    // console.log(this.count)
  },

  getCount() {
    // return this.count || 0;
  },

  pick(object: any, keys: any){
    return keys.reduce((obj: any, key: any) => {
      if (object && Object.prototype.hasOwnProperty.call(object, key)) {
        // eslint-disable-next-line no-param-reassign
        obj[key] = object[key];
      }
      return obj;
    }, {});
  }

};

module.exports = utils;
