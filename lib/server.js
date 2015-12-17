var Twitter = require('node-tweet-stream')
  , http = require('http')
  , url = require('url')
  , terms = require('twitter-search-terms')
  , combine = require('./combine')

var Server = module.exports = function (redis, credentials) {
  if (!redis) {
    throw new Error('Redis client needed')
  }

  if (!credentials) {
    throw new Error('Twitter credentials required')
  }

  var publisher = (new (require('./publisher'))(redis))

  // Register the lua script

  this.stream = new Twitter(credentials)
  this.stream.on('tweet', function (tweet) {
    try {
      publisher.broadcast(tweet, combine(terms(tweet.text)))
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

  return server = http.createServer(function (req, res) {
    var _url = url.parse(req.url, true)

    if (_url.pathname === '/track') {
      tracks.push(_url.query.keyword)
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(tracks))
    } else if (_url.pathname === '/untrack') {
      untracks.push(_url.query.keyword)
      res.end(JSON.stringify(untracks))
    } else {
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(self.stream.tracking()))
    }
  }).listen(port)
}
