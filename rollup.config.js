import resolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import postCss from 'rollup-plugin-postcss';
import postCssSimpleVars from 'postcss-simple-vars';
import postCssNested from 'postcss-nested';
import {name} from './package.json';

export default {
  external: ['three'],
  input: './lib/index.js',
  output: [
    {
      format: 'umd',
      name: 'ThreeForceGraph',
      globals: { three: 'THREE' },
      file: `output.js`,
      sourcemap: false,
      banner: `// Version ${name} - Shit`
    }
  ],
  plugins: [
	  postCss({
		  plugins: [
			  postCssSimpleVars(),
			  postCssNested()
		  ]
	  }),
    resolve(),
    commonJs(),
    babel({ exclude: 'node_modules/**' })
  ]
};