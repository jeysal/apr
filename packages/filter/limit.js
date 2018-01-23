const run = require('./run');
const { limit: map } = require('apr-map');

/**
 * @kind function
 * @name limit
 * @memberof filter
 * @param {Array|Object|Iterable} input
 * @param {Number} limit
 * @param {Function} iteratee
 * @returns {Promise}
 */
module.exports = (input, limit, fn, opts) =>
  run(input, map(input, limit, fn, opts));
