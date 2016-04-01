[![NPM](https://nodei.co/npm/yocto-doc.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yocto-doc/)

![alt text](https://david-dm.org/yoctore/yocto-doc.svg "Dependencies Status")
[![Code Climate](https://codeclimate.com/github/yoctore/yocto-doc/badges/gpa.svg)](https://codeclimate.com/github/yoctore/yocto-doc)
[![Test Coverage](https://codeclimate.com/github/yoctore/yocto-doc/badges/coverage.svg)](https://codeclimate.com/github/yoctore/yocto-doc/coverage)
[![Issue Count](https://codeclimate.com/github/yoctore/yocto-doc/badges/issue_count.svg)](https://codeclimate.com/github/yoctore/yocto-doc)
[![Build Status](https://travis-ci.org/yoctore/yocto-doc.svg?branch=master)](https://travis-ci.org/yoctore/yocto-doc)

# Overview

This module generate documentation for source.
Documentation was builded from jsDoc & Minami or docdash theme

## How to use

> In your project install our plugin

```shell
# If you install from npm registry
npm install yocto-doc --save-dev
```

### Overview & Options

In your project's Gruntfile, add a section named `yoctodoc` to the data object 
passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  yoctodoc : {
      options : {
        // theme if you want to change (mimani and docdash is available) => docdash by default
        // change your path destination
        destination : 'Your_new_absolute_destination_path',
        // change your documentation name
        name : 'Your New name to set into your generated documentation'
      },
      // Set all your file here
      all : [ 'file.js', 'file2.js', 'file3.js' ]
    }
});

// load task
grunt.loadNpmTasks('yoctodoc');
// register task
grunt.registerTask('doc', 'yoctodoc');
```

# How to run ? 

```shell
grunt doc
```

=> Data will output on a "documentation" directory on your current project path