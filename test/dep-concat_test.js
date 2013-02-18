'use strict';

var grunt = require( 'grunt' );
var fileGraph = require( '../tasks/lib/file-graph' ).init( grunt );

// ======== A Handy Little Nodeunit Reference ========
// https://github.com/caolan/nodeunit
//
// Test methods:
//   test.expect(numAssertions)
//   test.done()
// Test assertions:
//   test.ok(value, [message])
//   test.equal(actual, expected, [message])
//   test.notEqual(actual, expected, [message])
//   test.deepEqual(actual, expected, [message])
//   test.notDeepEqual(actual, expected, [message])
//   test.strictEqual(actual, expected, [message])
//   test.notStrictEqual(actual, expected, [message])
//   test.throws(block, [error], [message])
//   test.doesNotThrow(block, [error], [message])
//   test.ifError(value)

exports['dep-concat'] = {
  setUp: function( done ) {
    // setup here
    done();
  },

  dist: function( test ) {
    test.expect(1);
    test.ok( grunt.file.exists( 'tmp/test.js' ), 'Successfully run plugin' );
    test.done();
  },

  helper: function( test ) {
    var _ = grunt.util._;

    test.expect( 11 );
    var depList = fileGraph.parseFile( 'test/fixtures/main.js', {
      basePath: 'test/fixtures/'
    });

    test.deepEqual( depList.load, [
      'test/fixtures/8.js',
      'test/fixtures/10.js'
    ], 'correct load dependencies' );

    test.deepEqual( depList.run, [
      'test/fixtures/7.js'
    ], 'correct run dependencies' );

    fileGraph.topoSortFiles([
      'test/fixtures/main.js'
    ], function( orderedFiles ) {
      var indices = {};
      _.each([ 'main', 2, 5, 7, 8, 9, 10, 11 ], function( file ) {
        indices[ file ] = orderedFiles.indexOf( 'test/fixtures/' + file + '.js' );
      });

      test.ok( indices[ 'main' ] > indices[ '8' ] );
      test.ok( indices[ 'main' ] > indices[ '10' ] );
      test.ok( indices[ '8' ] > indices[ '9' ] );
      test.ok( indices[ '7' ] > indices[ '8' ] );
      test.ok( indices[ '7' ] > indices[ '11' ] );
      test.ok( indices[ '5' ] > indices[ '11' ] );
      test.ok( indices[ '11' ] > indices[ '9' ] );
      test.ok( indices[ '11' ] > indices[ '2' ] );

      test.equal( _.filter( indices, function( e ) {
        return e !== -1;
      }).length, 8, 'all files included' );

      test.done();
    }, {
      basePath: 'test/fixtures/'
    });
  }
};
