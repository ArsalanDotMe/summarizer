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

module.exports = isEqual
