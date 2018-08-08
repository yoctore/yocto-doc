[![NPM](https://nodei.co/npm/yocto-doc.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yocto-doc/)

![alt text](https://david-dm.org/yoctore/yocto-doc.svg "Dependencies Status")
[![Code Climate](https://codeclimate.com/github/yoctore/yocto-doc/badges/gpa.svg)](https://codeclimate.com/github/yoctore/yocto-doc)
[![Test Coverage](https://codeclimate.com/github/yoctore/yocto-doc/badges/coverage.svg)](https://codeclimate.com/github/yoctore/yocto-doc/coverage)
[![Issue Count](https://codeclimate.com/github/yoctore/yocto-doc/badges/issue_count.svg)](https://codeclimate.com/github/yoctore/yocto-doc)
[![Build Status](https://travis-ci.org/yoctore/yocto-doc.svg?branch=master)](https://travis-ci.org/yoctore/yocto-doc)

# Overview

This grunt module was build to generate : 
- Classic javascript documentation from [http://usejsdoc.org/](jsdoc) comment.
- Rest API documentation based on [http://apidocjs.com/](apidoc) comment

## How to install

```bash
npm install --save-dev yocto-doc
```

### How to configure

In you Gruntfile.js add this :

```javascript
'use strict';

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    // Default package
    pkg : grunt.file.readJSON('package.json'),

    // Define yocto doc config
    yoctodoc : {
      options : {
        api : true // To generator API documentation
      },
      all : [ 'PATH_OF_YOUR_JS_FILE' ]
    }
  });

  // Load npm task
  grunt.loadNpmTasks('yocto-doc');
  grunt.registerTask('doc', [ 'yoctodoc' ]);
};
```

## How to use 

```bash
grunt doc
```

## Output

- Classic Javascript documentation : by default this documentation was exported into **docs/jsdoc** directory.
- API Rest documentation : by default this documentation was exported into **docs/api-doc** directory.

## API generator usage

**@apiSchema**

By default [yocto-doc](https://www.npmjs.com/package/yoctodoc) generate doc from [api-doc](http://apidocjs.com/) comment tag, but those tags must not be defined in your classic javascript comment.

We do this just to keep a clean code comment, because [api-doc](http://apidocjs.com/) comment can be huge and long to write.

At this point you must use the <code>@apiSchema</code> tag to defined the path of your [api-doc](http://apidocjs.com/) definition.

For example : 

```javascript
/**
 * A huge and long classic comment 
 *
 * @param {String} a a description 
 * @param {String} b b description 
 * @return {String} return description
 * 
 * @apiSchema path_to_your_api_doc_schema_definition.js
 */
```

During the process [yocto-doc](https://www.npmjs.com/package/yoctodoc) will try to load all of your schema and build the doc from this definition.


**@apiHeader and @apiFooter**

By default [api-doc](http://apidocjs.com/) provide a <code>header</code> and <code>footer</code> configuration, but this configuration must be set on a <code>apidoc.json</code> file at the root of your projet.

With [yocto-doc](https://www.npmjs.com/package/yoctodoc) your can set it on your classic javascript comment just after **@apiSchema** tag.

For example : 

```javascript
/**
 * A comment
 *
 * @class
 * @public
 *
 * @apiSchema path_to_your_api_doc_schema_definition.js
 * @apiHeader {YOUR_HEADER_TEXT_TITLE}(path_to_your_header_content.md)
 * @apiFooter {YOUR_FOOTER_TEXT_TITLE}(path_to_your_footer_content.md)
 */
```