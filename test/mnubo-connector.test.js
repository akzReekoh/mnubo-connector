'use strict'

const amqp = require('amqplib')

const CLIENT_ID = 'tPlQIrCvgWQbKtVlwudDhVfHlVecScb4Yp3XxkHglkKoa4iW4W'
const CLIENT_SECRET = 'dLvvx7rRqfQCBeyhbaWJtAeGu94kwCnjsDedcQB7aM230JvKFW'
const ENV = 'sandbox'

let _channel = null
let _conn = null
let app = null

describe('Mnubo Connector Test', () => {
  before('init', () => {
    process.env.ACCOUNT = 'adinglasan'
    process.env.CONFIG = JSON.stringify({
      clientId : CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      env : ENV
    })
    process.env.INPUT_PIPE = 'ip.mnubo'
    process.env.LOGGERS = 'logger1, logger2'
    process.env.EXCEPTION_LOGGERS = 'ex.logger1, ex.logger2'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'

    amqp.connect(process.env.BROKER)
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
      _channel = channel
    }).catch((err) => {
      console.log(err)
    })
  })

  after('close connection', function (done) {
    _conn.close()
    done()
  })

  describe('#start', function () {
    it('should start the app', function (done) {
      this.timeout(10000)
      app = require('../app')
      app.once('init', done)
    })
  })

  describe('#data', () => {
    it('should send data to third party client', function (done) {
      this.timeout(15000)

      let data = {
        deviceId : '87083952-912f-4f6d-bb7b-e75a7361dcb6',
        eventType: 'data',
        temp: 36
      }

      _channel.sendToQueue('ip.mnubo', new Buffer(JSON.stringify(data)))
      setTimeout(done, 10000)
    })
  })
})
