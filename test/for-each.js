const test = require('ava');

const { default: forEach, series } = require('../packages/for-each');
const getIttr = require('../packages/test-get-ittr');
const schedule = require('../packages/test-scheduler')();
const timeout = require('../packages/test-timeout');

test(
  'fulfill [] forEach',
  schedule(async t => {
    const then = timeout(4);
    const input = [1, 2, 3, 4];
    const order = [];

    await forEach(input.map(Number), async (v, i) => {
      input[i] = await then(v * 2);
      order.push(i);
    });

    t.deepEqual(input, [2, 4, 6, 8]);
    t.notDeepEqual(order, [0, 1, 2, 3]);
  })
);

test(
  'fulfill @@Iterator forEach',
  schedule(async t => {
    const then = timeout(4);
    const output = [];
    const order = [];

    await forEach(getIttr(), async (v, i) => {
      output[i] = await then(`${v}${v}`);
      order.push(i);
    });

    t.deepEqual(output, ['aa', 'bb', 'cc', 'dd']);
    t.notDeepEqual(order, [0, 1, 2, 3]);
  })
);

test(
  'fulfill {} forEach',
  schedule(async t => {
    const then = timeout(4);
    const output = {};
    const order = [];

    await forEach(
      {
        a: 1,
        b: 2,
        c: 3,
        d: 4
      },
      async (v, i) => {
        output[i] = await then(v * 2);
        order.push(i);
      }
    );

    t.notDeepEqual(order, [0, 1, 2, 3]);
    t.deepEqual(output, {
      a: 2,
      b: 4,
      c: 6,
      d: 8
    });
  })
);

test(
  'fail [] forEach',
  schedule(async t => {
    const then = timeout(4);

    await t.throws(
      forEach([1, 2, 3, 4], async (v, i) => {
        if (i > 2) {
          throw new Error('expected error');
        }

        return then(v * 2);
      })
    );
  })
);

test(
  'fail @@Iterator forEach',
  schedule(async t => {
    const then = timeout(4);

    await t.throws(
      forEach(getIttr(), async (v, i) => {
        if (i > 2) {
          throw new Error('expected error');
        }

        return then(`${v}${v}`);
      })
    );
  })
);

test(
  'fail {} forEach',
  schedule(async t => {
    const then = timeout(4);

    await t.throws(
      forEach(
        {
          a: 1,
          b: 2,
          c: 3,
          d: 4
        },
        async (v, i) => {
          if (i === 'c') {
            throw new Error('expected error');
          }

          return then(v * 2);
        }
      )
    );
  })
);

test(
  'fulfill [] forEachSeries',
  schedule(async t => {
    const then = timeout(4);
    const input = [1, 2, 3, 4];
    const order = [];

    await series(input.map(Number), async (v, i) => {
      input[i] = await then(v * 2);
      order.push(i);
    });

    t.deepEqual(input, [2, 4, 6, 8]);
    t.deepEqual(order, [0, 1, 2, 3]);
  })
);

test(
  'fulfill @@Iterator forEachSeries',
  schedule(async t => {
    const then = timeout(4);
    const output = [];
    const order = [];

    await series(getIttr(), async (v, i) => {
      output[i] = await then(`${v}${v}`);
      order.push(i);
    });

    t.deepEqual(output, ['aa', 'bb', 'cc', 'dd']);
    t.deepEqual(order, [0, 1, 2, 3]);
  })
);

test(
  'fulfill {} forEachSeries',
  schedule(async t => {
    const then = timeout(4);
    const output = {};
    const order = [];

    await series(
      {
        a: 1,
        b: 2,
        c: 3,
        d: 4
      },
      async (v, i) => {
        output[i] = await then(v * 2);
        order.push(i);
      }
    );

    t.deepEqual(order, ['a', 'b', 'c', 'd']);
    t.deepEqual(output, {
      a: 2,
      b: 4,
      c: 6,
      d: 8
    });
  })
);

test(
  'fail [] forEachSeries',
  schedule(async t => {
    const then = timeout(4);

    await t.throws(
      series([1, 2, 3, 4], async (v, i) => {
        if (i > 2) {
          throw new Error('expected error');
        }

        return then(v * 2);
      })
    );
  })
);

test(
  'fail @@Iterator forEachSeries',
  schedule(async t => {
    const then = timeout(4);

    await t.throws(
      series(getIttr(), async (v, i) => {
        if (i > 2) {
          throw new Error('expected error');
        }

        return then(`${v}${v}`);
      })
    );
  })
);

test(
  'fail {} forEachSeries',
  schedule(async t => {
    const then = timeout(4);

    await t.throws(
      series(
        {
          a: 1,
          b: 2,
          c: 3,
          d: 4
        },
        async (v, i) => {
          if (i === 'c') {
            throw new Error('expected error');
          }

          return then(v * 2);
        }
      )
    );
  })
);
