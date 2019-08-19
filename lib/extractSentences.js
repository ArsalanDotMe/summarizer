const cheerio = require('cheerio')
const sbd = require('sbd')

function extractFromHTML (htmlContent) {
  const $ = cheerio.load(htmlContent)
  const allsentences = []
  const title = $('h1').text()

  $('p').each(function (i, elem) {
    const sentences = sbd.sentences($(elem).text())
    sentences.forEach(function (sentence) {
      if (sentence.length > 2) {
        allsentences.push(sentence)
      }
    })
  })

  return {
    title,
    allsentences
  }
}

module.exports = {
  extractFromHTML
}
