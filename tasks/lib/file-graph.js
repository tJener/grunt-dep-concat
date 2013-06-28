// grunt-dep-concat
// https://github.com/tJener/grunt-dep-concat
//
// Copyright (c) 2013 Eric Li
// Licensed under the MIT license.

'use strict';

var path = require( 'path' );
var exec = require( 'child_process' ).exec;
var tsort = require('tsort');

exports.init = function( grunt ) {
  var exports = {};

  var _ = grunt.util._;
  var push = [].push;

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

  DependencyList.prototype = {};

  DependencyList.prototype.allDeps = function() {
    return this.load.concat( this.run );
  };

  DependencyList.prototype.genTsortString = function() {
    var tsortString = '';

    _.each( this.load, function( loadDep ) {
      tsortString += this.path + ' ' + loadDep + '\n';
    }.bind( this ));

    _.each( this.run.concat([ this.path ]), function( runDep ) {
      tsortString += runDep + ' ' + runDep + '\n';
    });

    return tsortString;
  };

  exports.topoSortFiles = function(
    // Array of filenames that will be scanned to determine dependencies.
    files,
    // Optional options.
    //   - basePath: Where all paths scanned are relative from.
    options,
    // This helper is async, callback is called when finished.
    callback
  ) {
    if ( typeof options === 'function' ) {
      options = {};
      callback = options;
    }

    var orderedFiles = [];

    // We destructively iterate through files, so do this on a copy.
    files = files.slice(0);

    options = _.defaults( options, {
      basePath: ''
    });

    var depGraphString = '';
    var checkedFiles = {};
    var file;
    while ( null != (file = files.shift()) ) {
      if ( !checkedFiles[ file ] ) {
        try {
          var dependencyList = exports.parseFile( file, options );

          checkedFiles[ file ] = true;
          Array.prototype.unshift.apply( files, dependencyList.allDeps() );
          depGraphString += dependencyList.genTsortString();
        }

        catch ( e ) {
          // This may be a directive like '<banner:meta.banner>' or similar.
          orderedFiles.push( file );
        }
      }
    }

    var graph = tsort();
    var unsorted = depGraphString.split( '\n' );
    for(var i = 0; i < unsorted.length - 1; i ++) {
      var split = unsorted[i].split( /\s+/ );

      if ( split[1] !== split[0] ) {
        graph.add( split[1], split[0] );
      } else {
        graph.add( split[0] );
      }
    }

    var sortedGraph = graph.sort();
    push.apply( orderedFiles, sortedGraph );

    callback( orderedFiles );
  };

  exports.parseFile = function( filepath, options ) {
    options = _.defaults( options || {}, {
      basePath: ''
    });

    var src = grunt.file.read( filepath );
    var comment_re = /^(?:\s*\/\/\s*(.*)|\s*\/\*(.*)\*\/)$/gm;

    // Grab comment lines.
    var matches, commentLines = [];
    while ( null != (matches = comment_re.exec( src )) ) {
      commentLines.push( matches[1] || matches[2] );
    }

    // Pull dependencies from comments.
    var deps = new DependencyList( filepath );
    _.each( commentLines, function( line ) {
      var split = _.words( line, ':' );

      if ( split.length > 1 ) {
        split = split.map( trimElems );

        var fileList;
        switch ( split[0] ) {
        case 'load':
          fileList = deps.load;
          break;
        case 'run':
          fileList = deps.run;
          break;
        }

        if ( fileList ) {
          var files = _.words( split[1], ',' ).map( trimElems ).map( exports.normalizePath );
          push.apply( fileList, files );
        }
      }
    });

    var pathMap = function( depPath ) {
      return path.join( options.basePath, depPath );
    };

    // Add deps to DependecyList.
    deps.load = deps.load.map( pathMap );
    deps.run  = deps.run.map( pathMap );
    return deps;
  };

  var trimElems = function( str ) {
    return _( str ).trim();
  };

  exports.normalizePath = function( p ) {
    return p.replace( /[\/\\]+/g, path.sep );
  };

  return exports;
};
