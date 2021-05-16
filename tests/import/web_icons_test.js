'use strict';

(() => {
	const Collection = require('../../src/collection'),
		Importer = require('../../src/import/web_icons');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing importing web icon files', () => {
		it('importing octicons.svg', done => {
			Importer('tests/files/octicons.svg')
				.then(collection => {
					expect(collection instanceof Collection).to.be.equal(true);
					expect(collection.prefix).to.be.equal('');
					let keys = collection.keys();
					expect(keys.includes('bug')).to.be.equal(true);
					expect(keys.includes('briefcase')).to.be.equal(true);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('importing octicons.svg with prefix', done => {
			Importer('tests/files/octicons.svg', {
				prefix: 'octicon',
			})
				.then(collection => {
					expect(collection instanceof Collection).to.be.equal(true);
					expect(collection.prefix).to.be.equal('octicon');
					let keys = collection.keys();
					expect(keys.includes('bug')).to.be.equal(true);
					expect(keys.includes('briefcase')).to.be.equal(true);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('importing file that does not exist', done => {
			Importer('tests/files/foo.svg')
				.then(collection => {
					done('Expected error');
				})
				.catch(err => {
					done();
				});
		});
	});
})();
