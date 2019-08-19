const _ = require('lodash')
const linearAlgebra = require('linear-algebra')({
  add: require('add')
})

const sententceSimilarity = require('./sentenceSimilarity')
const isMatrixEqual = require('./isMatrixEqual')
const processMatrix3Steps = require('./processMatrix3Steps')
const createLong = require('./createLong')

const Matrix = linearAlgebra.Matrix

function summarizeText (allSentences, summarySentenceCount) {
  const selectedSentences = []

  var M = Matrix.identity(allSentences.length)
  for (var i = allSentences.length - 1; i >= 0; i--) {
    for (var j = allSentences.length - 1; j >= 0; j--) {
      M.data[i][j] = sententceSimilarity(allSentences[i], allSentences[j])
    }
  }

  processMatrix3Steps(M)
  var V = new Matrix(createLong(0, M.rows, 1))

  while (true) {
    var vn = V.dot(M)
    if (isMatrixEqual(V, vn)) {
      break
    }
    V = vn
  }
  var collection = []
  for (var jj = M.cols - 1; jj >= 0; jj--) {
    collection.push({
      index: jj, mag: V.data[0][jj]
    })
  };

  var top5 = _.sortBy(_.pluck(_.take(((_.sortBy(collection, 'mag')).reverse()), summarySentenceCount), 'index'))

  top5.forEach(function (index) {
    selectedSentences.push(allSentences[index])
  })

  return {
    selectedSentences
  }
}

module.exports = summarizeText
