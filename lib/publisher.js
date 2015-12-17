var emitter = require('socket.io-emitter')

var Publisher = function (redis) {
  if (!redis) {
    throw new Error('Redis client required')
  }
  this.io = emitter(redis)
}

/*
 * Publishes to the socketio rooms
 */
Publisher.prototype.broadcast = function (payload, rooms, next) {
  var self = this
  // TODO This currently hits redis for each parsed keyword, rather than using a lua script for multiple publishes.
  // We need to reverse engineer the socket.io-emitter to do this in the lua script, so it's one call over the network
  rooms.forEach(function (room) {
    self.io.in(room).emit('tweet:' + room, payload)
  })
}

module.exports = Publisher
