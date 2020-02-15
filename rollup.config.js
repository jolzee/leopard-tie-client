import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import commonjs from 'rollup-plugin-commonjs';

const name = `leopardTieClient`;

const plugins = [
  babel(),
  nodeResolve({
    mainFields: ['module', 'jsnext']
  }),
  commonjs({
    include: `node_modules/**`
  }),
  filesize()
];

const isProd = process.env.NODE_ENV === `production`;
if (isProd) plugins.push(uglify.uglify());

export default {
  plugins,
  input: `src/index.js`,
  output: {
    file: `dist/umd/${name}${isProd ? `.min` : ``}.js`,
    format: `umd`,
    name: name
  }
};
