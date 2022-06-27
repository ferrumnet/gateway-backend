import { reject } from "bluebird";
var https = require('https');
var moment = require('moment');

const findCovalenthqBlock = async (job: any) => {

  let chainId = ''
  let start = ''
  let end = ''

  if (job.competition && job.competition.leaderboard
    && job.competition.leaderboard.leaderboardCurrencyAddressesByNetwork
    && job.competition.leaderboard.leaderboardCurrencyAddressesByNetwork.length > 0) {
    let cabn = job.competition.leaderboard.leaderboardCurrencyAddressesByNetwork[0]
    if (cabn.currencyAddressesByNetwork && cabn.currencyAddressesByNetwork.network && cabn.currencyAddressesByNetwork.network.chainId) {
      chainId = cabn.currencyAddressesByNetwork.network.chainId
    }
  }

  if (job.status && job.status == stringHelper.tagStartBlock) {
    console.log('send call for get startBlock')

    if (job.competition) {
      if (job.competition.status == 'cancelled' || job.competition.status == 'pending') { } else {
        await db.Competitions.findOneAndUpdate({ _id: job.competition._id }, { status: 'started' }, { new: true })
      }
    }

    if (job.competition && job.competition.startDate) {
      start = moment(job.competition.startDate).utc().format()
    }

    if (job.competition && job.competition.startDateAfterDelay) {
      end = moment(job.competition.startDateAfterDelay).utc().format()
    }

  } else {
    console.log('send call for get endBlock')

    if (job.competition) {
      if (job.competition.status == 'cancelled' || job.competition.status == 'pending') { } else {
        await db.Competitions.findOneAndUpdate({ _id: job.competition._id }, { status: 'completed' }, { new: true })
      }
    }

    if (job.competition && job.competition.endDate) {
      start = moment(job.competition.endDate).utc().format()
    }

    if (job.competition && job.competition.endDateAfterDelay) {
      end = moment(job.competition.endDateAfterDelay).utc().format()
    }
  }

  let config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  console.log(start)
  console.log(end)
  let url = `${(global as any).environment.covalenthqBaseUrl}${chainId}/block_v2/${start}/${end}/?quote-currency=USD&format=JSON&key=${(global as any).environment.covalenthqApiKey}`
  console.log(url)
  var options = {
    hostname: 'api.covalenthq.com',
    path: '/v1/' + `${chainId}/block_v2/${start}/${end}/?quote-currency=USD&format=JSON&key=${(global as any).environment.covalenthqApiKey}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const request = https.request(options, (res: any) => {
    let data = '';
    console.log(`statusCode: ${res.statusCode}`)
    res.on('data', (chunk: any) => {
      data += chunk;
    })
    if (res.statusCode === 202 || res.statusCode === 201 || res.statusCode === 200) {
      res.on('end', () => {
        var obj = JSON.parse(data);
        let res = obj.data
        if (res && res.items
          && res.items.length > 0) {
          if (res.items[0].height) {
            updateCompetition(job, res.items[0].height)
          }
        }
      });
    } else {
      res.on('end', () => {
        var obj = JSON.parse(data);
        console.log(obj)
      });
    }
  })

  request.on('error', (error: any) => {
    reject(error)
  })
  request.end()
}

const someFunction = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve('222'), 100)
  })
}

const updateCompetition = async (job: any, height: any) => {
  console.log('============height============')
  console.log(height)
  if (job.status && job.status == stringHelper.tagStartBlock) {
    await db.Competitions.findOneAndUpdate({ _id: job.competition._id }, { startBlock: height }, { new: true })
    let updatedJob = await db.Jobs.findOneAndUpdate({ _id: job._id }, { status: stringHelper.tagEndBlock, startBlock: height }, { new: true })
    updatedJob.competition = job.competition
    (global as any).timeoutHelper.setCompetitionTimeout(updatedJob)
  } else {
    await db.Competitions.findOneAndUpdate({ _id: job.competition._id }, { endBlock: height }, { new: true })
    await db.Jobs.findOneAndUpdate({ _id: job._id }, { endBlock: height }, { new: true })
    await db.Jobs.remove({ _id: job._id })
  }

}


module.exports.findCovalenthqBlock = findCovalenthqBlock;
