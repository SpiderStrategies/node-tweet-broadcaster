var Scripto = require('redis-scripto')
  , Twitter = require('node-tweet-stream')
  , upnode = require('upnode')
  , terms = require('twitter-search-terms')
  , combine = require('./combine')

var Server = module.exports = function (redis, credentials) {
  if (!redis) {
    throw new Error('Redis client needed')
  }

  if (!credentials) {
    throw new Error('Twitter credentials required')
  }

  var manager = new Scripto(redis)
    , publisher = (new (require('./publisher'))(manager))

  // Register the lua script
  manager.loadFromFile('multi-publish', __dirname + '/../lua/multi-publish.lua')

  this.stream = new Twitter(credentials)
  this.stream.on('tweet', function (tweet) {
    try {
      publisher.broadcast(JSON.stringify(tweet), combine(terms(tweet.text)))
    } catch (e) {
      // don't care
    }
  })
}

/*
 * Listening port and a frequency to update the tracking keywords (one minute default)
 */
Server.prototype.listen = function (port, frequency) {
  var self = this
    , tracks = []
    , untracks = []

  setInterval(function () {
    tracks.forEach(function (track) {
      self.stream.track(track, false)
    })
    untracks.forEach(function (track) {
      self.stream.untrack(track, false)
    })
    tracks = []
    untracks = []
    self.stream.reconnect()
  }, frequency || 60 * 1000)

  var server = upnode(function (remote, conn) {
    this.track = function (keyword) {
      tracks.push(keyword)
    }

    this.untrack = function (keyword) {
      untracks.push(keyword)
    }

    this.tracking = function (next) {
      next(null, self.stream.tracking())
    }
  })

  return server.listen(port)
}
