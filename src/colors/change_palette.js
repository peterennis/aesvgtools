/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const cheerio = require('cheerio');
const Color = require('cyberalien-color');
const Tokenizer = require('simple-tokenizer');

/**
 * Change palette
 *
 * Must run SVGO optimization before running this script!
 *
 * @param {SVG} svg SVG object
 * @param {string|object} palette
 * @return {Promise}
 */
module.exports = (svg, palette) => {
	return new Promise((fulfill, reject) => {
		let $root = svg.$svg(':root'),
			addColor =
				typeof palette === 'string'
					? palette
					: palette.add === void 0
					? false
					: palette.add;

		/**
		 * Check if value equals 'none'
		 *
		 * @param {string} value
		 * @returns {boolean}
		 */
		function isNone(value) {
			return value.toLowerCase().trim() === 'none';
		}

		/**
		 * Parse style
		 *
		 * @param {string} style
		 * @returns {string}
		 */
		function parseStyle(style) {
			if (typeof style !== 'string') {
				return '';
			}

			let tokens = new Tokenizer({
				splitRules: true,
			}).tokenize(style);

			tokens.forEach(token => {
				if (token.token === 'rule') {
					let key = token.key.toLowerCase();
					switch (key) {
						case 'stop-color':
						case 'fill':
						case 'stroke':
							let color = Color.fromString(token.value);
							if (color === null) {
								return;
							}
							if (typeof palette === 'string') {
								token.value = palette;
							} else {
								let colorKey = token.value,
									callbackColor = null;

								if (palette[colorKey] === void 0) {
									colorKey = color.toString({ compress: true });
									if (palette[colorKey] === void 0) {
										// Make sure actual color is used in callback
										callbackColor = colorKey;
										colorKey = 'default';
										if (palette[colorKey] === void 0) {
											return;
										}
									}
								}

								let newColor = palette[colorKey];
								if (typeof newColor === 'function') {
									// Get color from callback('css', color, token, key)
									newColor = newColor(
										'css',
										callbackColor === null ? colorKey : callbackColor,
										token,
										key
									);
								}
								if (typeof newColor === 'string') {
									token.value = palette[colorKey];
								}
							}
							break;
					}
				}
			});

			return Tokenizer.build(tokens, { minify: true });
		}

		/**
		 * Check child elements of tag
		 *
		 * @param {object} $tag
		 * @param {object} params
		 */
		function parseChildElements($tag, params) {
			$tag.children().each((index, child) => {
				let $child = cheerio(child),
					shape = false;

				//noinspection FallThroughInSwitchStatementJS
				switch (child.tagName) {
					case 'mask': // mask
					case 'clipPath': // clip path
					case 'defs': // definitions
					case 'filter': // filters
						return;

					case 'style':
						$child.text(parseStyle($child.text()));
						return;

					case 'path':
					case 'circle':
					case 'line':
					case 'polygon':
					case 'polyline':
					case 'rect':
					case 'ellipse':
						shape = true;

					default:
						let attributes = params;
						if (shape || Object.keys(child.attribs).length) {
							let props = child.attribs;

							// Mix values with parent values
							attributes = Object.assign(Object.create(null), params);

							// Check for fill and stroke
							['fill', 'stroke'].forEach(attr => {
								if (props[attr] !== void 0) {
									// Node has fill or stroke - check value
									if (isNone(props[attr])) {
										// Color is set to "none" - ignore node
										attributes[attr] = false;
										return;
									}

									// Change color
									if (typeof palette !== 'string') {
										let colorKey = props[attr],
											callbackColor = null;
										if (palette[colorKey] === void 0) {
											let color = Color.fromString(props[attr]);
											if (color !== null) {
												colorKey = color.toString({ compress: true });
											}
										}
										if (
											palette[colorKey] === void 0 &&
											palette.default !== void 0
										) {
											// Send actual color instead of 'default' to callback
											callbackColor = colorKey;
											colorKey = 'default';
										}
										if (palette[colorKey] !== void 0) {
											let newColor = palette[colorKey];
											// Call callback('node', color, $node, attr) to get new color
											if (typeof newColor === 'function') {
												newColor = newColor(
													'node',
													callbackColor === null ? colorKey : callbackColor,
													$child,
													attr
												);
											}
											if (typeof newColor === 'string') {
												$child.attr(attr, newColor);
											}
										}
									}

									if (props[attr] !== void 0) {
										attributes[attr] = props[attr];
									}
								} else if (shape && attributes[attr] === true) {
									// Shape that supposed to have color, but it is not set. Set default value

									// Get color value from callback('add', $node)
									let color =
										typeof addColor === 'function'
											? addColor('add', $child)
											: addColor;
									if (typeof color === 'string') {
										$child.attr(attr, color);
										attributes[attr] = color;
									}
								}
							});
						}
						parseChildElements($child, attributes);
				}
			});
		}

		// Do stuff
		parseChildElements($root, {
			fill: true,
			stroke: false,
		});

		fulfill(svg);
	});
};
