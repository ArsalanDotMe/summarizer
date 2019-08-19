
function processMatrix3Steps (M, aplha = 0.15) {
  for (let i = M.rows - 1; i >= 0; i--) {
    let magnitude = M.data[i].sum()
    for (let j = M.cols - 1; j >= 0; j--) {
      M.data[i][j] = M.data[i][j] / magnitude
      if (isNaN(M.data[i][j])) {
        M.data[i][j] = 0
      }
      M.data[i][j] = M.data[i][j] * (1 - aplha)
      M.data[i][j] = M.data[i][j] + (aplha / (M.rows))
      if (isNaN(M.data[i][j])) {
        throw new Error('NaN')
      }
    }
  }
}

module.exports = processMatrix3Steps
