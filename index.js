'use strict'

const program = require('commander')
const fs = require('fs')
const { extractFromHTML } = require('./lib/extractSentences')
const summarizeText = require('./lib/summarizeText')
const exportAsHTML = require('./lib/exportAsHTML')

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

fs.readFile(program.filename, function (err, data) {
  if (err) {
    console.error(err)
  }
  const { title, allsentences } = extractFromHTML(data)

  const { selectedSentences } = summarizeText(allsentences, program.sentences)

  exportAsHTML(title, selectedSentences)
})
