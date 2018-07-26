'use strict';

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    // Default package
    pkg : grunt.file.readJSON('package.json'),

    // Configuration to be run (and then tested).
    yoctohint : {
      node : [ 'Gruntfile.js', 'tasks/yoctodoc.js' ]
    },

    // Define yocto doc config
    yoctodoc : {
      options : {
        destination    : './docs',
        copyExtraFiles : [ 'assets/*.png' ]
      },
      all : [ 'tasks/yoctodoc.js' ]
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Load npm task
  grunt.loadNpmTasks('yocto-hint');

  // Register Task
  grunt.registerTask('hint', [ 'yoctohint' ]);
  grunt.registerTask('doc', [ 'yoctodoc' ]);
  grunt.registerTask('default', [ 'hint', 'doc' ]);
};
