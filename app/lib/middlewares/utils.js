
const utils = {

  increaseTimeOutCount() {
    if(!this.count){
      this.count = 0
    }
    this.count += 1;
    console.log(this.count)
  },

  getCount() {
    return this.count || 0;
  }

};

module.exports = utils;
