const fs = require('fs')

function exportAsHTML (title, selectedSentences) {
  const heading = `# ${title}\n\n`
  const articleText = selectedSentences.join(' ')
  fs.writeFileSync('summary.md', heading + articleText)
}

module.exports = exportAsHTML
