'use strict'

const program = require('commander')
const fs = require('fs')
const format = require('format')
const cheerio = require('cheerio')
const _ = require('lodash')
const sbd = require('sbd')
const linearAlgebra = require('linear-algebra')({
  add: require('add')
})

const sententceSimilarity = require('./lib/sentenceSimilarity')

const Matrix = linearAlgebra.Matrix

program.version('0.0.1')
  .option('-f, --filename [filename]', 'File path to generate summary of')
  .option('-s, --sentences [num]', 'Number of sentences in summary')
  .parse(process.argv)

if (!program.filename) {
  console.log('filename parameter is required.')
  program.help()
}
program.sentences = program.sentences || 5
program.sentences = Number(program.sentences)
const paraSentenceIndex = []
let pindex = 0
paraSentenceIndex.getParaIndex = function (sindex) {
  var accsum = 0
  for (var i = 0; i < this.length; i++) {
    accsum = accsum + this[i]
    if (sindex < accsum) {
      return i
    }
  }
  return -1
}

function processMatrix3Steps (M, aplha) {
  if (!aplha) {
    aplha = 0.15
  }
  for (var i = M.rows - 1; i >= 0; i--) {
    var magnitude = M.data[i].sum()
    for (var j = M.cols - 1; j >= 0; j--) {
      M.data[i][j] = M.data[i][j] / magnitude
      if (isNaN(M.data[i][j])) {
        M.data[i][j] = 0
      }
      M.data[i][j] = M.data[i][j] * (1 - aplha)
      M.data[i][j] = M.data[i][j] + (aplha / (M.rows))
      if (isNaN(M.data[i][j])) {
        throw new Error('NaN')
      }
    };
  };
};

Array.createLong = function (filler, count, first) {
  var a = []
  for (var i = count - 1; i >= 0; i--) {
    a[i] = filler
  };
  if (first) {
    a[0] = first
  }
  return a
}

function isEqual (M1, M2, threshold) {
  if (M1.rows !== M2.rows || M1.cols !== M2.cols) {
    throw new Error('Rows and columns must be equal!')
  }
  for (var i = M1.rows - 1; i >= 0; i--) {
    for (var j = M1.cols - 1; j >= 0; j--) {
      if (M1.data[i][j].toFixed(18) !== M2.data[i][j].toFixed(18)) {
        return false
      }
    };
  };
  return true
}

fs.readFile(program.filename, function (err, data) {
  if (err) {
    console.error(err)
  }
  const allsentences = []
  const selectedSentences = []
  const $ = cheerio.load(data)
  const title = $('h1').text()

  $('p').each(function (i, elem) {
    const sentences = sbd.sentences($(elem).text())
    paraSentenceIndex[pindex] = sentences.length
    sentences.forEach(function (sentence) {
      if (sentence.length > 2) {
        allsentences.push(sentence)
      }
    })
    pindex = pindex + 1
  })

  var M = Matrix.identity(allsentences.length)
  for (var i = allsentences.length - 1; i >= 0; i--) {
    for (var j = allsentences.length - 1; j >= 0; j--) {
      M.data[i][j] = sententceSimilarity(allsentences[i], allsentences[j])
    }
  };

  processMatrix3Steps(M)
  var V = new Matrix(Array.createLong(0, M.rows, 1))

  while (true) {
    var vn = V.dot(M)
    if (isEqual(V, vn)) {
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

  var top5 = _.sortBy(_.pluck(_.take(((_.sortBy(collection, 'mag')).reverse()), program.sentences), 'index'))

  top5.forEach(function (index) {
    selectedSentences.push(allsentences[index])
  })

  var newDoc = $('<p></p>')
  var heading = format('<h1>%s</h1>', title)
  newDoc.text(selectedSentences.join(' '))
  fs.writeFileSync('summary.html', heading + newDoc.html())
})
