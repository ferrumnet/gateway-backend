
var moment = require('moment');

module.exports = {

  diffInHours: function (dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return Math.abs(Math.round(diff));
  }
  ,compareTime: function (time1, time2) {
    return new Date(time1) > new Date(time2);
  },
  addMinutesToDate: function (date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  },
  convertTimeIntoSpecificFormate: function (queryTime, inputFormate, outputFormate) {
    var count = 0;
    var date = moment(queryTime, inputFormate);
    var current = moment(date);
    return current.format(outputFormate);
  },
  convertTimeIntoSpecificFormate2: function (queryTime, outputFormate) {
    var count = 0;
    var date = moment(queryTime);
    var current = moment(date);
    return current.format(outputFormate);
  },
  convertUTCtoUserTimeZone: function (UTCTime, timeZone) {
    var options = {
      timeZone: timeZone,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    };
    var formatter = new Intl.DateTimeFormat([], options);
    var localTime = formatter.format(UTCTime);
    console.log("convertedTime " + localTime)
    return localTime;
  }, convertUTCtoUserTimeZone2: function (UTCTime, timeZone) {
    var options = {
      timeZone: timeZone,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    };

    var formatter = new Intl.DateTimeFormat([], options);
    var localTime = formatter.format(new Date(UTCTime));
    var currentTime = formatter.format(new Date());
    console.log("convertedTime =================   " + currentTime, localTime)
    return localTime;
  }, getTomorrow: function () {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow;
  }, isAnOverlapEvent: function (queryStartTime, queryEndTime, startTime, endTime, id) {
    if (moment(startTime).isSameOrAfter(queryStartTime) && moment(endTime).isSameOrBefore(queryEndTime)) {
      return true;
    }
    return false;
  }, convertIntoTime: function (queryTime) {
    var count = 0;
    var formate = "YYYY-MM-DD HH:mm"
    var date = moment(queryTime, formate);

    var current = moment(date);

    return current.format('YYYY-MM-DD HH:mm');
  }, getLastFiveWeek: function (date) {
    let dates = [];
    dates.push((moment(date).subtract('days', -1).format('YYYY-MM-DD')) + "T00:00:00.000Z");
    dates.push((moment(date).subtract('days', 7).format('YYYY-MM-DD')) + "T00:00:00.000Z");
    dates.push((moment(date).subtract('days', 14).format('YYYY-MM-DD')) + "T00:00:00.000Z");
    dates.push((moment(date).subtract('days', 21).format('YYYY-MM-DD')) + "T00:00:00.000Z");
    dates.push((moment(date).subtract('days', 28).format('YYYY-MM-DD')) + "T00:00:00.000Z");
    dates.push((moment(date).subtract('days', 35).format('YYYY-MM-DD')) + "T00:00:00.000Z");
    return dates;
  }, getLastFiveMonth: function (date) {
    let dates = [];
    dates.push((moment(date).add('month', 1).format('YYYY-MM')) + "-01T00:00:00.000Z");
    dates.push((moment(date).add('month', 0).format('YYYY-MM')) + "-01T00:00:00.000Z");
    dates.push((moment(date).subtract('month', 1).format('YYYY-MM')) + "-01T00:00:00.000Z");
    dates.push((moment(date).subtract('month', 2).format('YYYY-MM')) + "-01T00:00:00.000Z");
    dates.push((moment(date).subtract('month', 3).format('YYYY-MM')) + "-01T00:00:00.000Z");
    dates.push((moment(date).subtract('month', 4).format('YYYY-MM')) + "-01T00:00:00.000Z");
    return dates;
  }, getLast30Days: function () {
    let dates = [];
    for (let index = 0; index < 31; index++) {
      dates.push((moment().subtract('days', index).format('YYYY-MM-DD')) + "T00:00:00.000Z");
    }
    return dates;
  }, getDesirePreviousMonthFromGivenDate: function (date,days) {
    return (moment(date).subtract(days, 'month').format('YYYY-MM-DD')) + "T00:00:00.000Z"
  },diffInDays: function (endDate, startDate) {
    let dt1 = moment(startDate).utc().startOf('day')
    let dt2 = moment(endDate).utc().startOf('day')
    var resultInDays = dt2.diff(dt1, 'days')
    return resultInDays;
  },diffInMinuts: function (endDate, startDate) {
    let dt1 = moment(startDate).utc()
    let dt2 = moment(endDate).utc()
    var resultInMinutes = dt2.diff(dt1, 'minutes')
    return resultInMinutes;
  },isToday: function (date) {
    date = moment(date).utc()
    return date.isSame(new Date(), "day");;
  },getOtp: function () {
    return Math.floor(100000 + Math.random() * 900000)
  }

}

