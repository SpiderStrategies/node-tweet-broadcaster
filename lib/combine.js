/*
 * Combines array search terms, up to three words.
 * e.g. ['my', 'favorite', 'widget'] -> ['my', 'my favorite', 'my favorite widget', 'favorite', 'favorite widget', widget']
 */
module.exports = function (array) {
  return array.map(function (val, i, org) {
    var n1 = org[i + 1]
      , n2 = org[i + 2]
    if (n1 && n2) {
      return [val, val + ' ' +  n1, val + ' ' + n1 + ' ' + n2]
    } else if (n1) {
      return [val, val + ' ' + n1]
    } else {
      return [val]
    }
  }).reduce(function (result, next) {
    return result.concat(next)
  })
}
