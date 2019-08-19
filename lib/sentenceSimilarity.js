const _ = require('lodash')
const natural = require('natural')
const tokenizer = new natural.WordTokenizer()
const log10 = require('./log10')

function sentenceSimilarityScore (s1, s2) {
  var w1s = tokenizer.tokenize(s1)
  var w2s = tokenizer.tokenize(s2)
  var is = _.intersection(w1s, w2s)
  var commoncount = is.length
  if (commoncount === 0) return 0
  var res = (commoncount / (log10(w1s.length) + log10(w2s.length)))
  if (isNaN(res)) {
    throw new Error('NaN')
  }
  return res
}

module.exports = sentenceSimilarityScore
