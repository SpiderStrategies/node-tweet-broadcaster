var http = require('http')
  , redis  = require('redis')
  , io = require('socket.io')
  , request = require('request')
  , fs = require('fs')
  , adapter = require('socket.io-redis')

var server = http.createServer(function (req, res) {
  return fs.createReadStream(__dirname + '/index.html').pipe(res)
}).listen(8080)

var io = io(server)

io.adapter(adapter({
  pubClient: redis.createClient(null, null, { detect_buffers: true }),
  subClient: redis.createClient(null, null, { detect_buffers: true })
}))

io.on('connection', function (socket) {

  socket.on('tweet:track', function (term) {
    socket.join(term)
    request('http://localhost:7001/track?keyword=' + term, function (err, resp, body) {
      console.log(body)
    })
  })

  socket.on('tweet:untrack', function (term) {
    socket.leave(term)
    request('http://localhost:7001/untrack?keyword=' + term, function (err, resp, body) {
      console.log(body)
    })
  })

  socket.on('disconnect', function () {
    var rooms = socket.rooms

    rooms.forEach(function (room) {
      if (room[0] === '/') {
        request('http://localhost:7001/untrack?keyword=' + room.substring(1), function (err, resp, body) {
          console.log(body)
        })
      }
    })
  })
})
