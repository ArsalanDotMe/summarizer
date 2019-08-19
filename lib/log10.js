const lg10 = Math.log(10)
function log10 (x) {
  var res = (Math.log(x) / lg10)
  if (isNaN(res)) {
    res = 0
  }
  return res
}

module.exports = log10
