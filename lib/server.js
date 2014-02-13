var Scripto = require('redis-scripto')
  , Twitter = require('node-tweet-stream')
  , dnode = require('dnode')
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

Server.prototype.listen = function (port) {
  var self = this

  var server = dnode(function (remote, conn) {
    this.track = function (keyword) {
      self.stream.track(keyword)
    }

    this.untrack = function (keyword) {
      self.stream.untrack(keyword)
    }

    this.tracking = function (next) {
      next(null, self.stream.tracking())
    }
  })

  return server.listen(port)
}
