// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';
import postCss from 'rollup-plugin-postcss';
import postCssSimpleVars from 'postcss-simple-vars';
import postCssNested from 'postcss-nested';
import babel from 'rollup-plugin-babel';
import { name } from './package.json';



export default {
	input: 'index.js',
	output: {
		file: 'output.js',
		format: 'umd',
		name: 'ForceGraph3D',
		source: true,
		banner: `// Version ${name} - Shit`,
		globals: { vars: 'vars' }
	},
	plugins: [
		postCss({
			plugins: [
				postCssSimpleVars(),
				postCssNested()
			]
		}),
		babel({ exclude: 'node_modules/**' }),
		resolve(),
		commonJs()
	]
};