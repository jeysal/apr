const Iterator = require('apr-engine-iterator');

module.exports = (input, fn, opts) => {
  const ittr = Iterator(input);

  let done = false;
  let brk = false;
  let i = 0;

  const after = (items, end) => v => {
    brk =
      brk || items.some((item, y) => opts.after && opts.after(v[y], item, i++));

    done = done || brk;

    return done ? end() : next(end);
  };

  const next = end => {
    const items = ittr.next(opts.limit).filter(item => {
      done = done || item.done;
      return !item.done;
    });

    const call = opts.call || (item => fn(item.value, item.key, input));

    Promise.all(items.map(call)).then(after(items, end), end);
  };

  return new Promise((resolve, reject) =>
    next((err, res) => (err ? reject(err) : resolve(res)))
  );
};
