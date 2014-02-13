local res = {}
local payload = {}
local data = {}

data.args = {}
data.args[1] = KEYS[1]

payload.nodeId = 'tw:' .. math.random(0, 999999999) -- Something totally random that won't collide

payload.args = {}
payload.args[3] = true -- volatile
payload.args[4] = {}
payload.args[4][1] = 0 -- lua treats empty arrays as hash tables, so fake an array value

for i = 1, #ARGV do
  -- the first argument in the payload is the room
  payload.args[1] = '/' .. ARGV[i]
  -- Broadcast to the name tweet:<term>. e.g. tweet:tacos, if the room we are broadcasting to is 'tacos'
  data.name = 'tweet:' .. ARGV[i] -- this is the message name we're broadcasting... e.g. socket.on('tweet:taco', function () {})
  payload.args[2] = '5:::' .. cjson.encode(data) -- Build the socketio payload. Totally reversed engineered. 5 is a socketio event packet code.
  table.insert(res, redis.call('publish', 'dispatch', cjson.encode(payload)))
end

return cjson.encode(payload)
