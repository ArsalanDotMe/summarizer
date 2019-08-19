function createLong (filler, count, first) {
  const a = new Array(count)
  for (let i = count - 1; i >= 0; i--) {
    a[i] = filler
  }
  if (first) {
    a[0] = first
  }
  return a
}

module.exports = createLong
