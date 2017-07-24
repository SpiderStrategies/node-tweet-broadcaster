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
      var _tweet = {}

      // if it's a retweet, set the tweet equal to the original tweet
      // and set retweetedBy
      if (tweet.retweeted_status) {
        _tweet.retweetedBy = {
          name: tweet.user.name,
          screenName: tweet.user.screen_name
        }
        tweet = tweet.retweeted_status
      }

      _tweet.image = tweet.user.profile_image_url_https
      _tweet.name = tweet.user.screen_name
      _tweet.title = tweet.user.name
      _tweet.entities = Object.keys(tweet.entities).reduce(function (p, key) {
        var type = tweet.entities[key]
        p[key] = type.map(function (entity) {
          return {
            id: entity.id_str, // twitter ids are too large for socket.io-redis encoding, so use the string
            indices: entity.indices,
            url: entity.url,
            display_url: entity.display_url,
            text: entity.text,
            name: entity.name,
            screen_name: entity.screen_name
          }
        })
        return p
      }, {})

      _tweet.content = tweet.text
      _tweet.timestamp = new Date(Date.parse(tweet.created_at.replace(/( +)/, ' UTC$1')))
      _tweet.id = tweet.id_str

      publisher.broadcast(_tweet, combine(terms(_tweet.content)))
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
