var Publisher = function (manager) {
  if (!manager) {
    throw new Error('Redis script manager required')
  }
  this.manager = manager
}

/*
 * Publishes to the socketio rooms
 */
Publisher.prototype.broadcast = function (payload, rooms, next) {
  this.manager.run('multi-publish', [payload], rooms, next)
}

module.exports = Publisher
