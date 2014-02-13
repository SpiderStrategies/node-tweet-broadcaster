var combine = require('../lib/combine')
  , assert = require('assert')

describe('Combines', function () {

  it('Combines terms', function () {
    assert.deepEqual(combine(['my', 'favorite', 'widget']), [
      'my', 'my favorite', 'my favorite widget', 'favorite', 'favorite widget', 'widget'
    ])
  })
})
