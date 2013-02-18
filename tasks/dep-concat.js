// grunt-dep-concat
// https://github.com/tJener/grunt-dep-concat
//
// Copyright (c) 2013 Eric Li
// Licensed under the MIT license.

'use strict';

module.exports = function( grunt ) {
  var fileGraph = require( './lib/file-graph' ).init( grunt );
  var helpers = require( 'grunt-lib-legacyhelpers' ).init( grunt );

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask( 'depconcat', 'Concatenate files, ordered by dependencies.', function() {
    var done = this.async();

    var options = this.options();

    this.files.forEach(function( f ) {
      var sources = f.src.filter(function( path ) {
        if ( !grunt.file.exists( path )) {
          grunt.log.warn( 'Source file "' + path + '" not found.' );
          return false;
        }

        return true;
      });

      var orderedFiles = [];
      fileGraph.topoSortFiles( sources, orderedFiles, function() {
        var src = helpers.concat( orderedFiles );

        grunt.file.write( f.dest, src );

        if ( this.errorCount ) {
          done( false );
          return;
        }

        grunt.log.writeln('File "' + f.dest + '" created.');
        done( true );
      }.bind( this ), options );
    }, this );
  });
};
