'use strict';

var _         = require('lodash');
var hooker    = require('hooker');
var glob      = require('glob');
var path      = require('path');
var os        = require('os');
var comment   = require('comment-regex');

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
  var apiDocConfig  = [ process.cwd(), 'docs', 'pivot', 'apidoc.json' ].join('/');
  var appPackage    = JSON.parse(grunt.file.read([ process.cwd(), 'package.json' ].join('/')));

  // Default api doc configuration
  var apiDocConfigContent = {
    name        : appPackage.name,
    version     : appPackage.version,
    description : appPackage.description || [ 'API Documentation for', appPackage.name, appPackage.version ].join(' '),     
    title       : [ 'API Documentation for', appPackage.name, appPackage.version ].join(' '),
    header      : {},
    footer      : {},
    template    : {
      forceLanguage : 'en'
    },
    extra : {}
  };

  // Is real path
  var realpath = path.normalize([ __dirname, '..' ].join('/'));
  
  // Default config option to use on build process
  var defaultOptions = {
    jsdoc : {
      dist : {
        options : {
          destination : [ process.cwd(), 'docs/jsdoc' ].join('/'),
          configure   : configPath,
          template    : [
            realpath,
            'node_modules',
            'jsdoc-template'
          ].join('/'),
          readme     : [ process.cwd(), 'README-JSDOC.md' ].join('/'),
          extraFiles : [ ]
        },
        src : []
      }
    },
    apidoc : {
      all : {
        src         : [ process.cwd(), 'docs', 'pivot' ].join('/'),
        dest        : [ process.cwd(), 'docs', 'api' ].join('/'),
        template    : [ __dirname, 'themes', 'apidoc' ].join('/')
      }
    }
  };


  // if readmeJSDoc not exist create it
  if (!grunt.file.exists(defaultOptions.jsdoc.dist.options.readme)) {
    // show log message
    grunt.log.error('You must create a README-JSDOC.md at your root project directory to build your documentation.');
    // default statement
    return 0;
  }

  // Default global task
  var globalTasks = [ 'jsdoc' ];

  // Append default options to grunt config
  grunt.config.set('jsdoc', defaultOptions.jsdoc);
  grunt.config.set('apidoc', defaultOptions.apidoc);
  
  // Register runner tasks
  grunt.registerTask('yoctodoc:runner', 'Documentation runner', function () {
    // Current internal Task
    var currentTask;

    // Filte task to get correct task to process.
    // Keep safe all other task in grunt config
    var tasks = _.filter(Object.keys(grunt.config.data), function (key) {
      // default process
      return _.includes(globalTasks, key);
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

              // apidoc is set ?
              if (_.includes(globalTasks, 'apidoc')) {
                content = content.replace(/(<body>)/gi, '<body class="api-enabled">');
              }

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

    grunt.log.ok('Cleaning previous docs .....');
    grunt.file.delete(defaultOptions.jsdoc.dist.options.destination);

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

      // is api flag is enabled
      if (options.api) {
        // create pivot directory
        grunt.file.mkdir(defaultOptions.apidoc.all.src);

        // Try to get all files to process
        var allFiles = _.uniq(_.map(this.data, function (src) {
          // default statement
          return path.resolve(_.first(grunt.file.expand(src)));
        }));

        var rules   = [ {
          key : 'header',
          reg : /(\@apiHeader)\s*\{+([^}]+)\}+\s*\(+([^)]+)\)+/gm,
          values : {}
        }, {
          key : 'footer',
          reg : /(\@apiFooter)\s*\{+([^}]+)\}+\s*\(+([^)]+)\)+/gm,
          values : {}
        }];

        grunt.log.ok('Building sources for apidoc before global process');
        // parse all files and get comment only
        allFiles = _.compact(_.map(allFiles, function (file) {
          // create default file name
          var filename  = [ defaultOptions.apidoc.all.src, [ 'comment', path.basename(file) ].join('-') ].join('/');
          var matches   = grunt.file.read(file).match(comment()).join(os.EOL);
          var schemas   = _.uniq(matches.match(/(\@apiSchema.*)$/gm));

          _.each(rules, function (rule) {
            // current match
            var m;
            // parse all
            while ((m = rule.reg.exec(grunt.file.read(file))) !== null) {
              // This is necessary to avoid infinite loops with zero-width matches
              if (m.index === rule.reg.lastIndex) {
                rule.reg.lastIndex++;
              }
              // only on this case
              if (_.isEmpty(rule.values)) {
                _.set(rule.values, 'title', m[2]); 
                _.set(rule.values, 'filename', m[3]); 
              } else {
                grunt.log.warn([ 'An existing rules', m[1], 'was already defined. Skipping this this new rules => ', m[1], m[2], m[3] ].join(' '));
              }
            }
            // update value
            _.set(apiDocConfigContent, rule.key, rule.values);
          });
          // get api doc config t use the same content
          var configUsed = JSON.parse(grunt.file.read(configPath));
          var date = new Date();
          // update config for api
          _.set(apiDocConfigContent, 'extra.generator',
            configUsed.opts.footer
                    .replace('%date%', date)
                    .replace('%appname%', grunt.config.data.pkg.name)
                    .replace('%year%', date.getFullYear()));
          // Try to delete an existing file to avoid error
          grunt.file.delete(apiDocConfig);

          // create api doc config file is not exists
          grunt.file.write(apiDocConfig, JSON.stringify(apiDocConfigContent));

          // load definitions to write
          var definitions = _.map(schemas, function (schema) {
            // get schema definition path
            var schemaDefinition = _.trim(schema.replace('@apiSchema', ''));
            // log path
            grunt.log.ok([ 'Trying to load schema definition on', schemaDefinition ].join(' '));
            // try to load content of files
            return grunt.file.read(schemaDefinition);
          });

          // only if content is not empty
          if (!_.isEmpty(definitions)) {
            // create file with comment content
            grunt.file.write(filename, definitions.join(os.EOL));
            // default statement
            return !_.isEmpty(_.trim(grunt.file.read(filename)));
          }
          // default statement
          return false;
        }));

        // only if we dont have empty result
        if (!_.isEmpty(allFiles)) {
          // add apiDoc in current task process
          globalTasks.push('apidoc');
        }
      }

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
  grunt.loadNpmTasks('grunt-apidoc');
};
