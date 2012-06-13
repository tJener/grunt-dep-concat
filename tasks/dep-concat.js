// grunt-dep-concat
// https://github.com/tJener/grunt-dep-concat
//
// Copyright (c) 2012 Eric Li
// Licensed under the MIT license.

module.exports = function( grunt ) {
  var _ = grunt.utils._;

  var path = require( 'path' );
  var util = require( 'util' );
  var exec = require( 'child_process' ).exec;
  var spawn = require( 'child_process' ).spawn;

  // A DependencyList describes two sets of dependencies, which I am calling
  // "loadtime" and "runtime" dependencies. "Loadtime" is when the concatenated
  // file is initially executed, and "runtime" is, well, during runtime. An
  // example may be clearer:
  //
  //     (function( $ ) {
  //       $(function() {
  //         console.log( _ );
  //       });
  //     }( jQuery ));
  //
  // Here jQuery is a "loadtime" dependency, and underscore/lodash is a
  // "runtime" dependency.
  var DependencyList = function DependencyList( path ) {
    this.path = path;
    this.load = [];
    this.run  = [];
  };

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask( 'depconcat', 'Concatenate files, ordered by dependencies.', function() {
    var done = this.async();

    var files = grunt.file.expandFiles( this.file.src );
    var orderedFiles = [];
    grunt.helper( 'depconcat_order_files', files, orderedFiles, function() {
      var src = grunt.helper( 'concat', orderedFiles, { separator: this.data.separator });
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

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  var trimElems = function( str ) {
    return _( str ).trim();
  };

  grunt.registerHelper( 'depconcat_order_files', function( files, orderedFiles, callback, options ) {
    files = files.slice(0);

    options = _.defaults( options || {}, {
      basePath: ''
    });

    var dependencyList, file;
    var deps = {};
    while ( null != (file = files.shift()) ) {
      if ( !deps[ file ] ) {
        dependencyList = null;

        try {
          dependencyList = grunt.helper( 'depconcat_file_parse_deps', file, options );
        } catch( e ) {
          orderedFiles.push( file );
        }

        if ( dependencyList ) {
          deps[ file ] = dependencyList;
          Array.prototype.unshift.apply( files, dependencyList.load.concat( dependencyList.run ) );
        }
      }
    }

    var depGraphString = '';
    var insertLoadDep = function( dependency ) {
      depGraphString += prop + ' ' + dependency + '\n';
    };

    var insertRunDep = function( dependency ) {
      depGraphString += dependency + ' ' + dependency + '\n';
    };

    for ( var prop in deps ) {
      dependencyList = deps[ prop ];
      _.each( dependencyList.load, insertLoadDep );
      _.each( dependencyList.run,  insertRunDep  );

      // This makes sure to always add each listed source file to the files
      // being concatenated.
      insertRunDep( dependencyList.path );
    }

    exec( 'echo "' + depGraphString + '" | tsort', function( error, stdout, stderr ) {
      Array.prototype.push.apply( orderedFiles, _( stdout ).words( '\n' ).reverse() );

      callback();
    });
  });

  // Given a file, grabs the source and returns a DependencyList.
  grunt.registerHelper( 'depconcat_file_parse_deps', function( filepath, options ) {
    options = _.defaults( options || {}, {
      basePath: ''
    });

    var src = grunt.file.read( filepath );
    return parseDeps( src, new DependencyList( filepath ), options );
  });

  var parseDeps = function( src, dependencyList, options ) {
    var comment_re = /^(?:\s*\/\/\s*(.*)|\s*\/\*(.*)\*\/)$/gm;

    // Grab comment lines.
    var matches, lines = [];
    while ( null != (matches = comment_re.exec( src )) ) {
      lines.push( matches[1] || matches[2] );
    }

    var deps = {};
    _.each([ 'load', 'run' ], function( prop ) {
      deps[ prop ] = [];
    });

    // Pull dependencies from comments.
    _.each( lines, function( line ) {
      var split = _.words( line, ':' ).map( trimElems );

      if ( split.length > 1 ) {
        var fileList = deps[ split[0] ];
        if ( Array.isArray(fileList) ) {
          Array.prototype.push.apply(
            fileList,
            _.words( split[1], ',' ).map( trimElems )
          );
        }
      }

    });

    var pathMap = function( filePath ) {
      return path.join( options.basePath, filePath );
    };

    // Add deps to DependecyList.
    for ( var prop in deps ) {
      Array.prototype.push.apply( dependencyList[ prop ], deps[prop].map(pathMap) );
    }

    return dependencyList;
  };

};
