"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Optimize = require('../../src/optimize/svgo'),
        Opacify = require('../../src/colors/opacify');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing changing colors to opacity', () => {
        it('changing colors to opacity for simple shape', done => {
            const originalIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">' +
                    '<path fill="#D9D9D9" d="M340 585c0-5.5 4.5-10 10-10h44c5.5 0 10 4.5 10 10v171h355V563c0-136.4-110.6-247-247-247S265 426.6 265 563v193h75V585z"/>' +
                    '<path d="M216.9 310.5l39.6-39.6c3.1-3.1 3.1-8.2 0-11.3l-67.9-67.9a8.03 8.03 0 0 0-11.3 0l-39.6 39.6a8.03 8.03 0 0 0 0 11.3l67.9 67.9c3.1 3.1 8.1 3.1 11.3 0zm669.6-79.2l-39.6-39.6a8.03 8.03 0 0 0-11.3 0l-67.9 67.9a8.03 8.03 0 0 0 0 11.3l39.6 39.6c3.1 3.1 8.2 3.1 11.3 0l67.9-67.9c3.1-3.2 3.1-8.2 0-11.3zM484 180h56c4.4 0 8-3.6 8-8V76c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v96c0 4.4 3.6 8 8 8zm348 712H192c-17.7 0-32 14.3-32 32v24c0 4.4 3.6 8 8 8h688c4.4 0 8-3.6 8-8v-24c0-17.7-14.3-32-32-32zm-639-96c0 17.7 14.3 32 32 32h574c17.7 0 32-14.3 32-32V563c0-176.2-142.8-319-319-319S193 386.8 193 563v233zm72-233c0-136.4 110.6-247 247-247s247 110.6 247 247v193H404V585c0-5.5-4.5-10-10-10h-44c-5.5 0-10 4.5-10 10v171h-75V563z"/>' +
                    '</svg>',
                expectedIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">' +
                    '<path fill="#000" d="M340 585c0-5.5 4.5-10 10-10h44c5.5 0 10 4.5 10 10v171h355V563c0-136.4-110.6-247-247-247S265 426.6 265 563v193h75V585z" fill-opacity="0.15"/>' +
                    '<path d="M216.9 310.5l39.6-39.6c3.1-3.1 3.1-8.2 0-11.3l-67.9-67.9a8.03 8.03 0 0 0-11.3 0l-39.6 39.6a8.03 8.03 0 0 0 0 11.3l67.9 67.9c3.1 3.1 8.1 3.1 11.3 0zm669.6-79.2l-39.6-39.6a8.03 8.03 0 0 0-11.3 0l-67.9 67.9a8.03 8.03 0 0 0 0 11.3l39.6 39.6c3.1 3.1 8.2 3.1 11.3 0l67.9-67.9c3.1-3.2 3.1-8.2 0-11.3zM484 180h56c4.4 0 8-3.6 8-8V76c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v96c0 4.4 3.6 8 8 8zm348 712H192c-17.7 0-32 14.3-32 32v24c0 4.4 3.6 8 8 8h688c4.4 0 8-3.6 8-8v-24c0-17.7-14.3-32-32-32zm-639-96c0 17.7 14.3 32 32 32h574c17.7 0 32-14.3 32-32V563c0-176.2-142.8-319-319-319S193 386.8 193 563v233zm72-233c0-136.4 110.6-247 247-247s247 110.6 247 247v193H404V585c0-5.5-4.5-10-10-10h-44c-5.5 0-10 4.5-10 10v171h-75V563z"/>' +
                    '</svg>';

            let svg = new SVG(originalIcon);

            Opacify(svg).then(() => {
                expect(svg.toString()).to.be.equal(expectedIcon);
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('changing colors to opacity for style', done => {
            const originalIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">' +
                    '<style>path { fill: #D9D9D9; } g { stroke: #000; fill-opacity: .5; fill: gray;} </style>' +
                    '<path d="M340 585c0-5.5 4.5-10 10-10h44c5.5 0 10 4.5 10 10v171h355V563c0-136.4-110.6-247-247-247S265 426.6 265 563v193h75V585z"/>' +
                    '</svg>',
                expectedIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">' +
                    '<style>path{fill:currentColor;fill-opacity:0.15;}g{stroke:currentColor;fill:currentColor;stroke-opacity:1;fill-opacity:0.25;}</style>' +
                    '<path d="M340 585c0-5.5 4.5-10 10-10h44c5.5 0 10 4.5 10 10v171h355V563c0-136.4-110.6-247-247-247S265 426.6 265 563v193h75V585z"/>' +
                    '</svg>';

            let svg = new SVG(originalIcon);

            Opacify(svg, 'currentColor').then(() => {
                expect(svg.toString()).to.be.equal(expectedIcon);
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });
    });
})();
