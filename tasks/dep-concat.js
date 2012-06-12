// grunt-dep-concat
// https://github.com/lie2/grunt-dep-concat
//
// Copyright (c) 2012 Eric Li
// Licensed under the MIT license.

module.exports = function( grunt ) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerTask( 'dep-concat', 'Your task description goes here.', function() {
    grunt.log.write(grunt.helper( 'dep-concat' ));
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper( 'dep-concat', function() {
    return 'dep-concat!!!';
  });

};
