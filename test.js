var Scripto = require('redis-scripto')
var scriptManager = new Scripto(require('redis').createClient())

scriptManager.loadFromFile('script-one', __dirname + '/lua/multi-publish.lua')

scriptManager.run('script-one', ['this is my tweet!'], ['beer', 'tacos'], function (err, result) {
  if (err) { console.log(err) }

  console.log(result)
  process.exit(0)
})
