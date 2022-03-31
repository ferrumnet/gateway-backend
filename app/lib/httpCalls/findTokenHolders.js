
const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper } = global
const axios = require('axios').default;
const https = require('https');

const findTokenHolders = async (model, isFromSnapshotEvent = false) => {
  sendCallForBlockNo(model, isFromSnapshotEvent)
}

const sendCallForBlockNo = async (model, isFromSnapshotEvent) => {
  let timestamp = Math.round(new Date().getTime() / 1000).toString();
  console.log(timestamp);

  let config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  let path = `/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${global.environment.bscscanApiKey}`
  console.log(path)
  var options = {
    hostname: global.environment.bscscanHostName,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const request = https.request(options, res => {
    let data = '';
    console.log(`statusCode: ${res.statusCode}`)
    res.on('data', chunk => {
      data += chunk;
    })
    if (res.statusCode === 202 || res.statusCode === 201 || res.statusCode === 200) {
      res.on('end', () => {
        var res = JSON.parse(data);
        if (res && res.result) {
          model.currentBlock = res.result
          sendCallForTokenHolders(model, isFromSnapshotEvent)
        }
      });
    } else {
      res.on('end', () => {
        var obj = JSON.parse(data);
        console.log(obj)
      });
    }
  })

  request.on('error', error => {
    reject(error)
  })
  request.end()

}

const sendCallForTokenHolders = async (model, isFromSnapshotEvent) => {
  let tokenContractAddress = ''

  if (model.tokenContractAddress) {
    tokenContractAddress = model.tokenContractAddress
  }

  let config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  let path = `/api?module=token&action=tokenholderlist&contractaddress=${tokenContractAddress}&apikey=${global.environment.bscscanApiKey}`
  console.log(path)
  var options = {
    hostname: global.environment.bscscanHostName,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const request = https.request(options, res => {
    let data = '';
    console.log(`statusCode: ${res.statusCode}`)
    res.on('data', chunk => {
      data += chunk;
    })
    if (res.statusCode === 202 || res.statusCode === 201 || res.statusCode === 200) {
      res.on('end', () => {
        var res = JSON.parse(data);
        // console.log(res)
        if (res && res.result && typeof res.result != 'string' && res.result.length > 0) {
          updateTokenHolders(model, res.result, isFromSnapshotEvent)
        }else {
          if(res.message){
            let update = {status: 'failed', errorMessage: res.message}
            updateTokenHolderBalanceSnapshotEvent(model, update)
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

  request.on('error', error => {
    reject(error)
  })
  request.end()

}

const updateTokenHolders = async (model, result, isFromSnapshotEvent) => {
  console.log('============result============')
  console.log(result.length)
  console.log(model)

  if (result && result.length > 0) {
    for (let i = 0; i < result.length; i++) {
      if (isFromSnapshotEvent) {
        result[i].tokenHolderBalanceSnapshotEvent = model.tokenHolderBalanceSnapshotEvent
      }
      result[i].currencyAddressesByNetwork = model._id
      result[i].tokenContractAddress = model.tokenContractAddress
      result[i].currentBlock = model.currentBlock
      result[i].tokenHolderAddress = result[i].TokenHolderAddress
      result[i].tokenHolderQuantity = result[i].TokenHolderQuantity
      result[i].createdAt = new Date()
      result[i].updatedAt = new Date()
    }

    if (isFromSnapshotEvent) {
      await db.TokenHoldersBalanceSnapshots.insertMany(result)
      let update = {status: 'completed', errorMessage: 'success'}
      updateTokenHolderBalanceSnapshotEvent(model, update)
    } else {
      await db.TokenHoldersCurrencyAddressesByNetwork.deleteMany({ currencyAddressesByNetwork: model._id })
      await db.TokenHoldersCurrencyAddressesByNetwork.insertMany(result)

      await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.deleteMany({ currencyAddressesByNetwork: model._id })
      await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.insertMany(result)
    }
  }

}

const updateTokenHolderBalanceSnapshotEvent = async (model, update) => {
  await db.TokenHolderBalanceSnapshotEvents.findOneAndUpdate({ _id: model.tokenHolderBalanceSnapshotEvent }, update, { new: true })
}


module.exports.findTokenHolders = findTokenHolders;
