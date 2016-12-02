'use strict';

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    // default package
    pkg       : grunt.file.readJSON('package.json'),
    // Configuration to be run (and then tested).
    yoctohint : {
      options : {
        jshint : {}
      },
      all     : [ 'Gruntfile.js', 'tasks/yoctodoc.js' ]
    },
    // Define yocto doc config
    yoctodoc  : {
      options : {
        destination     : './documentation',
        copyExtraFiles  : [ 'assets/Capture-1.png', 'assets/*.png' ]
      },
      all     : [ 'tasks/yoctodoc.js' ]
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');
  // load npm task
  grunt.loadNpmTasks('yocto-hint');
  // Register Task
  grunt.registerTask('hint', [ 'yoctohint' ]);
  grunt.registerTask('doc', [ 'yoctodoc' ]);
  grunt.registerTask('default', [ 'hint', 'doc' ]);
};
