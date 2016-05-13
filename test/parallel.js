const test = require('ava');
const apr = require('../')

const p = require('./common/p');

test('fulfill []  parallel', async function(t) {
  const order = [];

  const output = await apr.parallel([
    async function() {
      order.push('before');
      const res = await p(1 * 2);
      order.push('after');
      return res;
    },
    async function() {
      order.push('before');
      const res = await p(2 * 2);
      order.push('after');
      return res;
    },
    async function() {
      order.push('before');
      const res = await p(3 * 2);
      order.push('after');
      return res;
    },
    async function() {
      order.push('before');
      const res = await p(4 * 2);
      order.push('after');
      return res;
    }
  ]);

  t.deepEqual(order, [
    'before',
    'before',
    'before',
    'before',
    'after',
    'after',
    'after',
    'after'
  ]);

  t.deepEqual(output, [2, 4, 6, 8]);
});

test('fulfill {} parallel', async function(t) {
  const order = [];

  const output = await apr.parallel({
    a: async function() {
      order.push('before');
      const res = await p(1 * 2);
      order.push('after');
      return res;
    },
    b: async function() {
      order.push('before');
      const res = await p(2 * 2);
      order.push('after');
      return res;
    },
    c: async function() {
      order.push('before');
      const res = await p(3 * 2);
      order.push('after');
      return res;
    },
    d: async function() {
      order.push('before');
      const res = await p(4 * 2);
      order.push('after');
      return res;
    }
  });

  t.deepEqual(order, [
    'before',
    'before',
    'before',
    'before',
    'after',
    'after',
    'after',
    'after'
  ]);

  t.deepEqual(output, {
    a: 2,
    b: 4,
    c: 6,
    d: 8
  });
});

test('fail [] parallel', async function(t) {
  t.throws(apr.parallel([
    async function() {
      return await p(1 * 2);
    },
    async function() {
      return await p(2 * 2);
    },
    async function() {
      throw new Error('expected error');
    },
    async function() {
      return await p(4 * 2);
    }
  ]));
});

test('fail {} parallel', async function(t) {
  t.throws(apr.parallel({
    a: async function() {
      return await p(1 * 2);
    },
    b: async function() {
      return await p(2 * 2);
    },
    c: async function() {
      throw new Error('expected error');
    },
    d: async function() {
      return await p(4 * 2);
    }
  }));
});