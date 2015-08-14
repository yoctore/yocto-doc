'use strict';

var _         = require('lodash');
var hooker    = require('hooker');
var beautify  = require('html');
var glob      = require('glob');

/**
 * Default export for grunt yocto-doc-plugin
 *
 * @module yoctodoc/grunt
 */
module.exports = function (grunt) {
  /**
   * @property configPath {String} Default configPath
   * @private
   */
  var configPath    = [ __dirname, 'yoctodoc.json' ].join('/');
  // default css to include
  var cssToInclude  = '<link type="text/css" rel="stylesheet" href="styles/yoctostyle.css"></head>';
  // default choosen themes
  var choosenTheme;

  // Default yocto config for jshint and jscs code style
  var defaultOptions = {
    jsdoc : {
      dist : {
        options : {
          destination : [ process.cwd(), 'documentation' ].join('/'),
          configure   : configPath,
          template    : [
            process.cwd(),
            'node_modules',
            'grunt-jsdoc',
            'node_modules',
            'ink-docstrap',
            'template'
          ].join('/'),
          readme      : [ process.cwd(), 'README.md' ].join('/')
        },
        src     : []
      }
    }
  };

  // Append default options to grunt config
  grunt.config.set('jsdoc', defaultOptions.jsdoc);

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerTask('yoctodoc:runner', 'Documentation runner', function () {
    // Current internal Task
    var currentTask;

    // Filte task to get correct task to process.
    // Keep safe all other task in grunt config
    var tasks = _.filter(Object.keys(grunt.config.data), function (key) {
      return key === 'jsdoc';
    });

    // Hook grunt task execution
    hooker.hook(grunt.task, 'runTaskFn', {
      pre : function (context) {
        if (currentTask !== undefined) {
          currentTask = true; // true indicates the task has finished successfully.
        }
        currentTask = context.nameArgs;
      }
    });

    // Hook into the success / fail writer.
    hooker.hook(grunt.log.writeln(), [ 'success', 'fail' ], function (res) {
      // check done or aborted
      var done    = res === 'Done, without errors.';
      var warning = res === 'Done, but with warnings.';
      var aborted = res === 'Aborted due to warnings.';
      var error   = warning || aborted;

      // Is finish ??
      if (done || error) {
        if (currentTask !== undefined) {
          currentTask = error ? false : true;

          // define default message
          var cMsg = {
            level : error ? 'warn' : 'ok',
            msg   : error ?
              'Documentation was not generated correctly. Please check your log ' :
              'Documentation was generated correctly.'
          };

          // Need to log end message with custom param
          grunt.log[cMsg.level](cMsg.msg);

          // Add yocto style in fo file
          grunt.log.ok('Move & Link yoctostyle.css into index.html');

          // needed property
          var htmlIndexPath = [ process.cwd(), 'documentation', 'index.html' ].join('/');

          // get current html
          var html          = grunt.file.read(htmlIndexPath);

          // replace html content to add our style
          html = html.replace(/<\/head>/gm, cssToInclude);

          // copy custom style on doc style directory
          grunt.file.copy(
            [ __dirname, 'yoctostyle.css' ].join('/'),
            [ grunt.config.data.jsdoc.dist.options.destination,
            'styles/yoctostyle.css' ].join('/')
          );

          // saving new template content
          grunt.file.write(htmlIndexPath, beautify.prettyPrint(html,  { indexSize : 2 }));

          // removing no needed file
          var unused = glob.sync([
            grunt.config.data.jsdoc.dist.options.destination,
            'styles',
            'site*.css'
          ].join('/'));

          // read & test all file
          _.each(unused, function (u) {
            // test if is not the current theme
            if (_.isNull(u.match([ 'site.', choosenTheme, '.css' ].join('')))) {
              grunt.file.delete(u);
            }
          });
          grunt.log.ok('Removing unused files finished.');
        }
      }
    });

    // Run each given task
    _.each(tasks, function (task) {
      grunt.task.run(task);
    });
  });

  // Register default plugin process
  grunt.registerMultiTask('yoctodoc',
    'Generate documention for yocto source from JsDoc & jaguarjs tools', function () {
    // default app name if current name of package.json
    var appName = grunt.config.data.pkg.name;

    // retrive options
    var options = this.options();

    // check if jshint option is given
    if (!_.isUndefined(options.destination) && !_.isNull(options.destination) &&
      _.isString(options.destination) && !_.isEmpty(options.destination)) {

      // Log message and merge options
      grunt.log.ok('New destination options given for yoctodoc. Processing update.');
      defaultOptions.jsdoc.dist.options.destination = options.destination;
      grunt.log.ok([ 'New destination added :',
        defaultOptions.jsdoc.dist.options.destination
      ].join(' '));
    }

    // Filter file and return correct file path
    this.data = this.filesSrc.map(function (filepath) {
      // exists ?
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn([ 'Source file"', filepath, '"not found.' ].join(' '));

        // bash value retutning false
        return false;
      } else {
        grunt.log.ok([ 'Source file "', filepath, '"exists. adding on filter list.'].join(' '));

        // return file path
        return filepath;
      }
    });

    if (!_.isUndefined(options.name) && !_.isNull(options.name) &&
      _.isString(options.name) && !_.isEmpty(options.name)) {

      // Log message and merge options
      grunt.log.ok('New name options given for yoctodoc. Processing update.');
      // assign
      appName = options.name;
      // inform
      grunt.log.ok([ 'New name added : [ ', appName, ' ] - Processing update.' ].join(''));
    }

    // change config of file for app name
    try {
      var configjsdoc = JSON.parse(grunt.file.read(configPath));
      // assign the application name
      configjsdoc.templates.applicationName = appName;
      choosenTheme                          = configjsdoc.templates.theme;
      // change config file
      grunt.file.write(configPath, JSON.stringify(configjsdoc, null, 2));

    } catch (e) {
      grunt.log.warn([ 'An error occured during changing name of documentation :', e].join(' '));
    }

    // Has data ?
    if (!_.isEmpty(this.data)) {
      // notify console
      grunt.log.ok([
        this.data.length,
        [ 'file', (this.data.length > 1 ? 's' : '') ].join(''),
        'found. Adding on source list.'
      ].join(' '));

      // Assign default options to config file
      defaultOptions.jsdoc.dist.src = this.data;

      // Merge config data to grunt config
      grunt.config.merge('jsdoc', defaultOptions.jsdoc);

      // notif console
      grunt.log.ok('Processing yoctodoc:runner ...');

      // Run tasks
      grunt.task.run('yoctodoc:runner');
    } else {
      grunt.log.warn('No source given. Please check your Grunfile config for yoctodoc');
    }
  });

  // Load grunt needed task
  grunt.loadNpmTasks('grunt-jsdoc');
};
