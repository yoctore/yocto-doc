'use strict';

var _         = require('lodash');
var hooker    = require('hooker');
var glob      = require('glob');
var path      = require('path');
var os        = require('os');

/**
 * This module is a grunt task to generate automatic documentation for a javascript project
 *
 * This module is based on <b><a class="blank" href="http://usejsdoc.org/">jsdoc</a></b> for language syntax
 * and on <b><a class="blank" href="https://github.com/braintree/jsdoc-template">Braintree JSDoc Template</a></b> for templating.
 *
 * To use it just setup your <code class="code">Gruntfile.js</code> file with this example and change needed property.
 *
 * @example
 *
 * module.exports = function (grunt) {
 *
 * grunt.initConfig({
 *  // default package
 *  pkg       : grunt.file.readJSON('package.json'),
 *  // Define yocto doc config
 *  yoctodoc  : {
 *    options : {
 *      destination     : './docs',
 *      copyExtraFiles  : [ 'assets/*.png' ]
 *    },
 *   all     : [ 'tasks/yoctodoc.js' ]
 *  }
 * });
 *
 * // Register Task
 * grunt.registerTask('doc', [ 'yoctodoc' ]);
 *
 * @module yoctore/yocto-doc
 */
module.exports = function (grunt) {
  // Default config path value
  var configPath    = [ __dirname, 'yoctodoc.json' ].join('/');

  // Is real path
  var realpath = path.normalize([ __dirname, '..' ].join('/'));

  // Default config option to use on build process
  var defaultOptions = {
    jsdoc : {
      dist : {
        options : {
          destination : [ process.cwd(), 'documentation' ].join('/'),
          configure   : configPath,
          template    : [
            realpath,
            'node_modules',
            'jsdoc-template'
          ].join('/'),
          readme     : [ process.cwd(), 'README.md' ].join('/'),
          extraFiles : [ ]
        },
        src : []
      }
    }
  };

  // Append default options to grunt config
  grunt.config.set('jsdoc', defaultOptions.jsdoc);

  // Register runner tasks
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
          currentTask = true; // True indicates the task has finished successfully.
        }
        currentTask = context.nameArgs;
      }
    });

    // Hook into the success / fail writer.
    hooker.hook(grunt.log.writeln(), [ 'success', 'fail' ], function (res) {
      // Check done or aborted
      var done    = res === 'Done, without errors.' || 'Done.';
      var warning = res === 'Done, but with warnings.';
      var aborted = res === 'Aborted due to warnings.';
      var error   = warning || aborted;

      // Is finish ??
      if (done || error) {
        if (currentTask !== undefined) {
          currentTask = !error;

          // Define default message
          var cMsg = {
            level : error ? 'warn' : 'ok',
            msg   : error ?
              'Documentation was not properly generated.' :
              'Documentation was generated properly.'
          };

          // Files to copy
          var fileToCopy = [
            {
              from : 'javascript/lodash.min.js',
              to   : 'scripts/lodash.min.js',
              type : 'js'
            },
            {
              from : 'javascript/search.js',
              to   : 'scripts/search.js',
              type : 'js'
            },
            {
              from : 'css/custom.css',
              to   : 'styles/custom.css',
              type : 'css'
            }
          ];

          // Only if all is done
          if (done) {
            // Parse all template to set properly the current header name
            var templates = glob.sync([
              grunt.config.data.jsdoc.dist.options.destination,
              '*.html'
            ].join('/'));

            // Extra files is defined ? Try to copy content on dest directory
            if (!_.isEmpty(defaultOptions.jsdoc.dist.options.extraFiles)) {
              // Info message
              grunt.log.ok('Copying extra files on destination path. please wait ...');

              // Copy all
              _.each(defaultOptions.jsdoc.dist.options.extraFiles, function (extra) {
                // Parse data
                var parse = path.parse(extra);

                // Try to copy extra file

                grunt.file.copy(extra, [
                  grunt.config.data.jsdoc.dist.options.destination, 'extras', parse.base
                ].join('/'));
              });
            }

            // Info message
            grunt.log.ok('Updating documentation please wait ...');

            // Current date
            var date = new Date();

            // Get config used
            var configUsed = JSON.parse(grunt.file.read(configPath));

            // Parse all files and process default replacement
            _.each(templates, function (t) {
              // Get content to process replace
              var content = grunt.file.read(t);

              // Remove tracking template
              content = content.replace(/<!-- start Mixpanel -->(.*)<!-- end Mixpanel -->/gmis, '');
              // replace header and footer content
              content = content.replace('%title%', grunt.config.data.pkg.name);
              content = content.replace('%version%', grunt.config.data.pkg.version);
              content = content.replace(/(<footer>)(.*)(<\/footer>)/gmis, [ 
                  '$1',
                  configUsed.opts.footer
                    .replace('%date%', date)
                    .replace('%appname%', grunt.config.data.pkg.name)
                    .replace('%year%', date.getFullYear()), '$3'
              ].join(''));
              // Replace html title
              content = content.replace(/(<title>)(.*- )(.*)(<\/title>)/gi, [
                '$1$2', grunt.config.data.pkg.name,'$4'
              ].join(''));

              // Parse all files to copy
              _.each(fileToCopy, function (file) {
                // Try to copy
                grunt.file.copy(
                  [ __dirname, file.from ].join('/'),
                  [ grunt.config.data.jsdoc.dist.options.destination, file.to ].join('/'));

                // Build correct header content
                var headerContent = file.type === 'css' ?
                  '<link type="text/css" rel="stylesheet" href="%s"/>'.replace('%s', file.to) :
                  '<script type="text/javascript" src="%s"></script>'.replace('%s', file.to);

                // Replace content
                content = content.replace(/(<\/head>)/gi, [ _.repeat(' ', 2), headerContent, os.EOL, '$1' ].join(''));
              });

              // Rewrite file with correct name
              grunt.file.write(t, content);
            });
          }

          // Need to log end message with custom param
          grunt.log[cMsg.level](cMsg.msg);
        }
      }
    });

    // Run each given task
    _.each(tasks, function (task) {
      grunt.task.run(task);
    });
  });

  // Register default plugin process
  grunt.registerMultiTask('yoctodoc', 'Generate js documention from JsDoc', function () {
    // Retrive options
    var options = this.options();

    // Check if jshint option is given
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
      // Exists ?
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn([ 'Source file "', filepath, '" not found.' ].join(''));

        // Bash value retutning false
        return false;
      }

      // Return file path
      return filepath;
    });

    // Prevent undefined value
    options.copyExtraFiles = options.copyExtraFiles || [];

    // Push default extra files
    options.copyExtraFiles.push([ __dirname, 'extras/*.png' ].join('/'));

    // Parse all extraFiles files
    _.each(options.copyExtraFiles || [], function (extra) {
      // Push all items on storage list
      defaultOptions.jsdoc.dist.options.extraFiles.push(glob.sync(extra, {
        absolute : true
      }));
    });

    // Normalize extraFiles storage
    defaultOptions.jsdoc.dist.options.extraFiles = _.uniq(
      _.flatten(defaultOptions.jsdoc.dist.options.extraFiles));

    // Has data ?
    if (!_.isEmpty(this.data)) {
      // Notify console
      grunt.log.ok([
        this.data.length,
        [ 'file', this.data.length > 1 ? 's' : '' ].join(''),
        'found. Adding on source list.'
      ].join(' '));

      // Assign default options to config file
      defaultOptions.jsdoc.dist.src = this.data;

      // Merge config data to grunt config
      grunt.config.merge('jsdoc', defaultOptions.jsdoc);

      // Notif console
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
