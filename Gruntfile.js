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
        name        : 'Yoctodoc plugin',
      },
      all     : [ 'test/index-test.js' ]
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');
  // load npm task
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('yoctohint');
  // Register Task
  grunt.registerTask('hint', [ 'yoctohint' ]);
  grunt.registerTask('doc', [ 'yoctodoc' ]);
};
