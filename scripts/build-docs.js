const apr = require('../package.json');
const { default: forEach } = require('../packages/for-each');
const series = require('../packages/series');
const awaitify = require('../packages/awaitify');
const main = require('../packages/main');
const isString = require('lodash.isString');
// eslint-disable-next-line object-curly-newline
const { build, formats } = require('documentation');
const readYaml = require('read-yaml');
const streamArray = require('stream-array');
const removeMd = require('remove-markdown');
// eslint-disable-next-line object-curly-newline
const { writeFile } = require('mz/fs');
const vfs = require('vinyl-fs');
const remark = require('remark');
const union = require('lodash.union');
const paramCase = require('param-case');
const globby = require('globby');
const pump = require('pump');
const path = require('path');

const onFinish = awaitify(pump);

const packages = globby
  .sync('packages/*/package.json', {
    cwd: path.join(__dirname, '..')
  })
  .map(name => name.replace(/^packages\//, '').replace(/\/package.json$/, ''));

const tocPath = path.join(__dirname, '../documentation.yml');
const toc = readYaml.sync(tocPath);
const tocPackages = toc.toc.filter(isString);
const files = tocPackages.map(pkg =>
  path.join(__dirname, `../packages/${pkg}/index.js`)
);

const options = {
  github: true
};

const individual = async () =>
  forEach(packages, async name => {
    const dir = path.join(__dirname, `../packages/${name}`);
    const pkg = require(path.join(dir, 'package.json'));

    const ast = await build([path.join(dir, 'index.js')], {});

    const dsc =
      ast.length && ast[0] && ast[0].description
        ? removeMd(
            remark()
              .stringify(ast[0].description)
              .split(/\n/)[1]
          )
        : pkg.dsc;

    const readme = await formats.md(ast, {});

    const pjson = JSON.stringify(
      {
        name: `apr-${name}`,
        license: apr.license,
        version: pkg.version,
        description: dsc,
        keywords: union((pkg.keywords || []).concat(name).concat(apr.keywords)),
        homepage: `https://apr.js.org#${paramCase(name)}`,
        bugs: apr.bugs,
        people: apr.people,
        author: apr.author,
        contributors: apr.contributors,
        repository: 'ramitos/apr',
        directories: pkg.directories,
        files: ['files'],
        bin: pkg.bin,
        man: pkg.man,
        main: `dist/apr-${name}.umd.js`,
        'jsnext:main': `dist/apr-${name}.es.js`,
        module: `dist/apr-${name}.es.js`,
        entry: 'index.js',
        scripts: pkg.scripts,
        config: pkg.config,
        dependencies: pkg.dependencies,
        devDependencies: pkg.devDependencies,
        peerDependencies: pkg.peerDependencies,
        bundleDdependencies: pkg.bundleDdependencies,
        optionalDependencies: pkg.optionalDependencies,
        engines: pkg.engines,
        preferGlobal: pkg.preferGlobal,
        private: pkg.private,
        publishConfig: pkg.publishConfig
      },
      null,
      2
    );

    await writeFile(path.join(dir, 'readme.md'), readme, {
      encoding: 'utf-8'
    });

    await writeFile(path.join(dir, 'package.json'), pjson, {
      encoding: 'utf-8'
    });
  });

const _toc = async () => {
  let last = '';

  const tree = toc.toc.reduce((tree, item) => {
    if (isString(item)) {
      return Object.assign(tree, {
        [last]: (tree[last] || []).concat([item])
      });
    }

    if (item.name === 'apr') {
      return tree;
    }

    last = item.name;

    return Object.assign(tree, {
      [item.name]: []
    });
  }, {});

  return Object.keys(tree).reduce(
    (toc, name) => {
      const parts = tree[name]
        .map(name => `* [${name}](#${paramCase(name)})`)
        .join('\n  ')
        .trim();

      toc += `
* [${name}](#${paramCase(name)})
  ${parts}
    `;

      return toc;
    },
    `
<a id="contents"></a>
## contents

`
  );
};

const all = async () => {
  const ast = await build(
    files,
    Object.assign(options, {
      config: tocPath
    })
  );

  let source = await formats.md(ast, {});
  const toc = await _toc();

  source = source.replace(/^## apr/, '# apr');
  source = source.replace(/<!-- \{\{TOC\}\} -->/, toc);

  await writeFile(path.join(__dirname, '../readme.md'), source, {
    encoding: 'utf-8'
  });
};

const website = async () => {
  const ast = await build(
    files,
    Object.assign(options, {
      config: tocPath
    })
  );

  const source = await formats.html(ast, {
    name: apr.name
  });

  const _files = streamArray(source);
  const _dest = vfs.dest(path.join(__dirname, '../docs'));

  await onFinish(_files, _dest);
};

main(
  series({
    website,
    individual,
    all
  })
);
