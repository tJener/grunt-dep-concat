// grunt-dep-concat
// https://github.com/tJener/grunt-dep-concat
//
// Copyright (c) 2013 Eric Li
// Licensed under the MIT license.

'use strict';

module.exports = function( grunt ) {
  var fileGraph = require( './lib/file-graph' ).init( grunt );
  var helpers = require( 'grunt-lib-legacyhelpers' ).init( grunt );
  var when = require( 'when' );

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask( 'depconcat', 'Concatenate files, ordered by dependencies.', function() {
    var task    = this;
    var done    = this.async();
    var options = this.options();

    when.map( this.files, function( f ) {
      var sources = f.src.filter(function( path ) {
        if ( !grunt.file.exists( path )) {
          grunt.log.warn( 'Source file "' + path + '" not found.' );
          return false;
        }

        return true;
      });

      var deferred = when.defer();
      fileGraph.topoSortFiles( sources, options, function( orderedFiles ) {
        var src = helpers.concat( orderedFiles );

        grunt.file.write( f.dest, src );

        if ( !task.errorCount ) {
          grunt.log.writeln( 'File "' + f.dest + '" created.' );
        }

        deferred.resolve( task.errorCount );
      });

      return deferred.promise;
    }).then(function( errorCounts ) {
      var errorCount = errorCounts.reduce(function( prev, curr ) {
        return prev + curr;
      });

      done( !errorCount );
    });
  });

};
