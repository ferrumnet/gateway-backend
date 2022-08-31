module.exports = {
  status200: function (data: any) {
    return {
      code: 200,
      data: data
    }
  },

  status400: function (data: any) {
    return {
      code: 400,
      message: data
    }
  },

}
