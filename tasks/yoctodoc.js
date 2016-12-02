'use strict';

var _         = require('lodash');
var hooker    = require('hooker');
var glob      = require('glob');
var semver    = require('semver');
var path      = require('path');

/**
 * Default export for grunt yocto-doc-plugin
 *
 * @module main
 */
module.exports = function (grunt) {
  // default config path value
  var configPath    = [ __dirname, 'yoctodoc.json' ].join('/');
  // is real path
  var realpath = path.normalize([ __dirname, '..' ].join('/'));

  // default config option to use on build process
  var defaultOptions = {
    jsdoc : {
      dist : {
        options : {
          destination : [ process.cwd(), 'documentation' ].join('/'),
          configure   : configPath,
          template    : [
            realpath,
            'node_modules',
            'postman-jsdoc-theme',
          ].join('/'),
          readme      : [ process.cwd(), 'README.md' ].join('/'),
          extraFiles  : []
        },
        src     : []
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
          currentTask = true; // true indicates the task has finished successfully.
        }
        currentTask = context.nameArgs;
      }
    });

    // Hook into the success / fail writer.
    hooker.hook(grunt.log.writeln(), [ 'success', 'fail' ], function (res) {
      // check done or aborted
      var done    = res === 'Done, without errors.' || 'Done.';
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
              'Documentation was not properly generated.' :
              'Documentation was generated properly.'
          };

          // only if all is done
          if (done) {
            // info message
            grunt.log.ok('Copying style files on destination path. please wait ...');
            // copy custom css to dest file
            grunt.file.copy(
              [ __dirname, 'css/custom.css' ].join('/'),
              [ grunt.config.data.jsdoc.dist.options.destination, 'styles/custom.css' ].join('/'));
            // copy custom css to dest file
            grunt.file.copy([ realpath, 'node_modules/color-themes-for-google-code-prettify',
              'dist/themes/tomorrow-night-bright.css'
            ].join('/'), [
              grunt.config.data.jsdoc.dist.options.destination, 'styles/tomorrow-night.min.css'
            ].join('/'));
            // parse all template to set properly the current header name
            var templates = glob.sync([
              grunt.config.data.jsdoc.dist.options.destination,
              '*.html'
            ].join('/'));

            if (!_.isEmpty(defaultOptions.jsdoc.dist.options.extraFiles)) {
              // info message
              grunt.log.ok('Copying extra files on destination path. please wait ...');
              // copy all
              _.each(defaultOptions.jsdoc.dist.options.extraFiles, function (extra) {
                // parse data
                var parse = path.parse(extra);
                grunt.file.copy(extra, [
                  grunt.config.data.jsdoc.dist.options.destination, 'extras', parse.base
                ].join('/'));
              });
            }

            // info message
            grunt.log.ok('Updating each page with custom value. please wait ...');

            // current date
            var date = new Date();

            // get config used
            var configUsed = JSON.parse(grunt.file.read(configPath));
            // parse all files
            _.each(templates, function (t) {
              // get content to process replace
              var content = grunt.file.read(t);
              // process default replacement
              content = content.replace(/(<title>)(.*\- )(.*)(<\/title>)/gi, [
                  '$1$2', grunt.config.data.pkg.name,'$4'
                ].join(''))
                .replace(/(<\/head>)/gi, [ _.repeat(' ', 4),
                '<link type="text/css" rel="stylesheet" href="styles/custom.css"/>\n$1' ].join(''))
                .replace(/(<\/head>)/gi, [ _.repeat(' ', 4),
                '<link type="text/css" rel="stylesheet" href="styles/tomorrow-night.min.css"/>\n$1'
                ].join(''))
                .replace(/(<footer>)(.*\n.*\n)(<\/footer>)/gi, [ '$1',
                  configUsed.opts.footer.replace('%date%', date)
                                        .replace('%appname%', grunt.config.data.pkg.name)
                                        .replace('%year%', date.getFullYear()), '$3' ].join(''))
                .replace(/(<nav>\n.*<h2>)(.*)(<\/h2>)/gi, [ '$1$2<span class="version">',
                    [ 'v', grunt.config.data.pkg.version ].join(''), '</span>$3'].join(''));

              // rewrite file with correct name
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
        grunt.log.warn([ 'Source file "', filepath, '" not found.' ].join(''));

        // bash value retutning false
        return false;
      }
      // return file path
      return filepath;
    });

    // parse all extraFiles files
    _.each(options.copyExtraFiles || [], function (extra) {
      // push all items on storage list
      defaultOptions.jsdoc.dist.options.extraFiles.push(glob.sync(extra, { absolute : true }));
    });

    // normalize extraFiles storage
    defaultOptions.jsdoc.dist.options.extraFiles = _.uniq(
      _.flatten(defaultOptions.jsdoc.dist.options.extraFiles));

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

  // save initial path
  var cwd             = process.cwd();
  // si lower than last node LTS version (6.9.1)
  var isLtThanLastLts = semver.lt(process.version, '6.9.1');

  // check is valid ?
  if (isLtThanLastLts) {
    // logging message
    grunt.log.ok([ 'Changing cwd directory to load modules because version of node is',
      process.version ].join(' '));
    // change path to yocto-hint modules
    process.chdir(realpath);
  }

  // Load grunt needed task
  grunt.loadNpmTasks('grunt-jsdoc');
  // return to the initial path
  process.chdir(cwd);
};
