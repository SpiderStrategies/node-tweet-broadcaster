#!/usr/bin/env node
var Server = require('../')
  , redis = require('redis')
  , args = require('yargs')
              .usage('Usage: $0 -k [string] -s [string] -t [string] -a [string]')
              .alias('k', 'consumer_key')
              .alias('s', 'consumer_secret')
              .alias('t', 'token')
              .alias('a', 'token_secret')
              .options('f', {
                alias: 'frequency',
                describe: 'frequency to update the twitter stream',
                default: 1000 * 60
              })
              .options('l', {
                alias: 'listen',
                describe: 'http port to listen for clients',
                default: 7001
              })
              .options('p', {
                alias: 'redis_port',
                default: 6379
              })
              .options('h', {
                alias: 'redis_host',
                default: '127.0.0.1'
              })
              .options('x', {
                alias: 'redis_password',
                default: null
              })
              .demand(['k','s', 't', 'a'])
              .argv

var redis = redis.createClient(args.p, args.h)

if (args.x) {
  redis.auth(args.x)
}

var server = new Server(redis, {
  consumer_key: args.k,
  consumer_secret: args.s,
  token: args.t,
  token_secret: args.a
}).listen(args.l, args.f)
