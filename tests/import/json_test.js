'use strict';

(() => {
	const Collection = require('../../src/collection'),
		Importer = require('../../src/import/json');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing importing json file', () => {
		const dir = 'tests/temp';

		function write(file, json) {
			fs.writeFileSync(dir + '/' + file, JSON.stringify(json), 'utf8');
		}

		function cleanup(file) {
			try {
				fs.unlinkSync(dir + '/' + file);
			} catch (err) {}
		}

		try {
			fs.mkdirSync(dir, 0o775);
		} catch (err) {}

		it('importing websymbol.json', done => {
			Importer(__dirname + '/../files/websymbol.json')
				.then(collection => {
					expect(collection.prefix).to.be.equal('');
					expect(
						collection.keys().indexOf('websymbol-user') === -1
					).to.be.equal(false);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('importing websymbol.json with prefix auto-detection', done => {
			Importer(__dirname + '/../files/websymbol.json', {
				detectPrefix: true,
			})
				.then(collection => {
					expect(collection.prefix).to.be.equal('websymbol');
					expect(collection.keys().indexOf('user') === -1).to.be.equal(false);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('importing arty-animated.json', done => {
			Importer(__dirname + '/../files/arty-animated.json')
				.then(collection => {
					expect(collection.prefix).to.be.equal('arty-animated');
					expect(collection.keys().indexOf('16-search') === -1).to.be.equal(
						false
					);
					expect(
						collection.keys(true).indexOf('arty-animated:16-search') === -1
					).to.be.equal(false);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('importing with aliases and extra properties', done => {
			const filename = 'import-aliases.json';

			write(filename, {
				icons: {
					'icon1': {
						body: '<icon1 />',
						left: -10,
						top: -5,
					},
					'second-icon': {
						body: '<icon 2/>',
						width: 8,
						height: 8,
						rotate: 2,
						vFlip: true,
					},
				},
				aliases: {
					'icon1-alias': {
						parent: 'icon1',
					},
					'icon1-rtl': {
						parent: 'icon1',
						hFlip: true,
					},
				},
				width: 64,
				height: 48,
			});

			Importer(dir + '/' + filename)
				.then(collection => {
					expect(collection.prefix).to.be.equal('');
					expect(collection.keys()).to.be.eql(['icon1', 'second-icon']);

					let icon1 = collection.items.icon1;
					let icon2 = collection.items['second-icon'];

					// Check for alias
					expect(icon1.aliases).to.be.eql([
						{
							name: 'icon1-alias',
						},
						{
							name: 'icon1-rtl',
							hFlip: true,
						},
					]);

					// Check dimensions and offset
					expect(icon1.width).to.be.equal(64);
					expect(icon1.height).to.be.equal(48);
					expect(icon1.left).to.be.equal(-10);
					expect(icon1.top).to.be.equal(-5);

					// Check for transformation
					expect(icon2.vFlip).to.be.equal(true);
					expect(icon2.rotate).to.be.equal(2);

					cleanup(filename);
					done();
				})
				.catch(err => {
					cleanup(filename);
					done(err ? err : 'exception');
				});
		});

		it('importing with categories', done => {
			const filename = 'import-categories.json';

			write(filename, {
				icons: {
					'icon1': {
						body: '<icon1 />',
					},
					'second-icon': {
						body: '<icon 2/>',
					},
					'third-icon': {
						body: '<icon 3/>',
					},
					'empty-icon': {
						body: '<icon-empty />',
					},
					'fifth-icon': {
						body: '<icon 5/>',
					},
				},
				width: 64,
				height: 48,
				categories: {
					'First Category': ['icon1', 'second-icon', 'fifth-icon'],
					'Another Category': ['third-icon'],
					'Third Category': ['fifth-icon'],
				},
			});

			Importer(dir + '/' + filename)
				.then(collection => {
					expect(collection.prefix).to.be.equal('');
					expect(collection.keys()).to.be.eql([
						'icon1',
						'second-icon',
						'third-icon',
						'empty-icon',
						'fifth-icon',
					]);

					let icon1 = collection.items.icon1;
					let icon2 = collection.items['second-icon'];
					let icon3 = collection.items['third-icon'];
					let icon4 = collection.items['empty-icon'];
					let icon5 = collection.items['fifth-icon'];

					// Check categories
					expect(icon1.category).to.be.eql(['First Category']);
					expect(icon2.category).to.be.eql(['First Category']);
					expect(icon3.category).to.be.eql(['Another Category']);
					expect(icon4.category).to.be.equal(void 0);
					expect(icon5.category).to.be.eql([
						'First Category',
						'Third Category',
					]);

					cleanup(filename);
					done();
				})
				.catch(err => {
					cleanup(filename);
					done(err ? err : 'exception');
				});
		});

		it('importing with themes', done => {
			const filename = 'import-themes.json';

			write(filename, {
				icons: {
					'solid-icon1': {
						body: '<icon1 />',
					},
					'outline-icon1': {
						body: '<icon1-o />',
					},
					'solid-icon3': {
						body: '<icon 3/>',
					},
					'empty-icon': {
						body: '<icon-empty />',
					},
					'fifth-icon': {
						body: '<icon 5/>',
					},
				},
				width: 64,
				height: 48,
				themes: {
					solid: {
						title: 'Solid',
						prefix: 'solid-',
					},
					outline: {
						title: 'Outline',
						prefix: 'outline-',
					},
				},
			});

			Importer(dir + '/' + filename)
				.then(collection => {
					expect(collection.prefix).to.be.equal('');
					expect(collection.keys()).to.be.eql([
						'solid-icon1',
						'outline-icon1',
						'solid-icon3',
						'empty-icon',
						'fifth-icon',
					]);

					// Check themes
					expect(collection.themes).to.be.eql({
						solid: {
							title: 'Solid',
							prefix: 'solid-',
						},
						outline: {
							title: 'Outline',
							prefix: 'outline-',
						},
					});

					cleanup(filename);
					done();
				})
				.catch(err => {
					cleanup(filename);
					done(err ? err : 'exception');
				});
		});

		it('importing with info', done => {
			const filename = 'import-info.json';

			write(filename, {
				info: {
					name: 'Foo',
					total: 5,
					author: {
						name: 'Iconify',
						url: 'https://github.com/iconify',
					},
					license: {
						title: 'MIT',
						spdx: 'MTI',
						url: 'https://spdx.org/licenses/MIT.html#licenseText',
					},
				},
				icons: {
					'solid-icon1': {
						body: '<icon1 />',
					},
					'outline-icon1': {
						body: '<icon1-o />',
					},
					'solid-icon3': {
						body: '<icon 3/>',
					},
					'empty-icon': {
						body: '<icon-empty />',
					},
					'fifth-icon': {
						body: '<icon 5/>',
					},
				},
				width: 64,
				height: 48,
			});

			Importer(dir + '/' + filename)
				.then(collection => {
					expect(collection.prefix).to.be.equal('');
					expect(collection.keys()).to.be.eql([
						'solid-icon1',
						'outline-icon1',
						'solid-icon3',
						'empty-icon',
						'fifth-icon',
					]);

					// Check themes
					expect(collection.info).to.be.eql({
						name: 'Foo',
						total: 5,
						author: {
							name: 'Iconify',
							url: 'https://github.com/iconify',
						},
						license: {
							title: 'MIT',
							spdx: 'MTI',
							url: 'https://spdx.org/licenses/MIT.html#licenseText',
						},
					});

					cleanup(filename);
					done();
				})
				.catch(err => {
					cleanup(filename);
					done(err ? err : 'exception');
				});
		});
	});
})();
