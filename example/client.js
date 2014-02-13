var dnode = require('dnode')

var d = dnode.connect(7001)

d.on('remote', function (remote) {
  remote.tracking(function (err, tracking) {
    console.log('currenting tracking', tracking)
    d.end()
  })
})
