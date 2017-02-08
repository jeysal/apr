const map = require('apr-map');
const run = require('./run');

module.exports = (input, fn, opts) => {
  return run(input, map(input, fn, opts));
};

module.exports.series = require('./series');
module.exports.limit = require('./limit');