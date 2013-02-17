// grunt-dep-concat
// https://github.com/tJener/grunt-dep-concat
//
// Copyright (c) 2013 Eric Li
// Licensed under the MIT license.

'use strict';

module.exports = function( grunt ) {
  var _ = grunt.utils._;

  var fileGraph = require( './lib/file-graph' ).init( grunt );

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask( 'depconcat', 'Concatenate files, ordered by dependencies.', function() {
    var done = this.async();

    var files = grunt.file.expandFiles( this.file.src );
    var orderedFiles = [];
    fileGraph.topoSortFiles( files, orderedFiles, function() {
      var src = grunt.helper( 'concat', orderedFiles, {
        separator: this.data.separator
      });

      grunt.file.write( this.file.dest, src );

      if ( this.errorCount ) {
        done( false );
        return;
      }

      grunt.log.writeln('File "' + this.file.dest + '" created.');
      done( true );
    }.bind( this ), {
      basePath: this.data.basePath
    });
  });

};
