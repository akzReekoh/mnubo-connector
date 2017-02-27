'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Connector()
let async = require('async')
let get = require('lodash.get')
let isArray = require('lodash.isarray')
let isError = require('lodash.iserror')
let isPlainObject = require('lodash.isplainobject')
let mnuboClient = null

let sendData = function (data, callback) {
  Object.assign(data, {
    'x_object': {
      'x_device_id': data.deviceId || get(data, 'rkhDeviceInfo._id')
    },
    'x_event_type': data.eventType || 'data'
  })

  delete data.deviceId
  delete data.eventType
  delete data.rkhDeviceInfo

  mnuboClient.events
    .send([data])
    .then(() => {
      _plugin.log(JSON.stringify({
        title: 'Data sent to Mnubo.',
        data: data
      }))

      callback()
    })
    .catch(callback)
}

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
_plugin.on('data', (data) => {
  console.log(data)
  if (isPlainObject(data)) {
    sendData(data, (error) => {
      if (error && isError(error)) {
        console.error(error)
        _plugin.logException(error)
      } else if (error && !isError(error)) {
        console.error(error)
        _plugin.logException(new Error(error.message))
      }
    })
  } else if (isArray(data)) {
    async.each(data, (datum, done) => {
      sendData(datum, done)
    }, (error) => {
      if (error && isError(error)) {
        console.error(error)
        _plugin.logException(error)
      } else if (error && !isError(error)) {
        console.error(error)
        _plugin.logException(new Error(error.message))
      }
    })
  } else {
    _plugin.logException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`))
  }
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  console.log(_plugin.config)
  let mnubo = require('mnubo-sdk')

  mnuboClient = new mnubo.Client({
    id: _plugin.config.clientId,
    secret: _plugin.config.clientSecret,
    env: _plugin.config.env
  })

  _plugin.log('Mnubo Connector has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
