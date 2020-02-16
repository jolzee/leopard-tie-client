import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify-es';
import filesize from 'rollup-plugin-filesize';
import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';

const name = `leopardTieClient`;

const plugins = [
  builtins(),
  babel(),
  json(),
  nodeResolve({
    mainFields: ['module', 'jsnext']
  }),
  commonjs({
    include: `node_modules/**`
  }),
  filesize()
];

const isProd = process.env.NODE_ENV === `production`;
if (isProd) plugins.push(uglify());

export default {
  plugins,
  input: `src/index.js`,
  output: {
    intro: 'var global = typeof self !== undefined ? self : this;',
    file: `dist/umd/${name}${isProd ? `.min` : ``}.js`,
    format: `umd`,
    name: name
  }
};
