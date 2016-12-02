[![NPM](https://nodei.co/npm/yocto-doc.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yocto-doc/)

![alt text](https://david-dm.org/yoctore/yocto-doc.svg "Dependencies Status")
[![Code Climate](https://codeclimate.com/github/yoctore/yocto-doc/badges/gpa.svg)](https://codeclimate.com/github/yoctore/yocto-doc)
[![Test Coverage](https://codeclimate.com/github/yoctore/yocto-doc/badges/coverage.svg)](https://codeclimate.com/github/yoctore/yocto-doc/coverage)
[![Issue Count](https://codeclimate.com/github/yoctore/yocto-doc/badges/issue_count.svg)](https://codeclimate.com/github/yoctore/yocto-doc)
[![Build Status](https://travis-ci.org/yoctore/yocto-doc.svg?branch=master)](https://travis-ci.org/yoctore/yocto-doc)

# Overview

This module generate documentation from source.

Documentation was builded with jsDoc and with customized postman-jsdoc-theme.

## How to use ?

First install with `npm` command.

```shell
# If you install from npm registry
npm install yocto-doc --save-dev
```

After that configure your project's Gruntfile with a new section named `yoctodoc` (see below).

```js
grunt.initConfig({
  yoctodoc : {
      options : {
        // change your path destination
        destination : 'Your_new_absolute_destination_path'
      },
      // Set all your file here
      all : [ 'file.js', 'file2.js', 'file3.js', 'OR a path all js files are added' ]
    }
});

// load task
grunt.loadNpmTasks('yoctodoc');
// register task
grunt.registerTask('doc', 'yoctodoc');
```

And run grunt command

```shell
grunt doc
```

## How to add external files on documentation directory ?

To use this feature you can use copyExtraFiles property on your grunt file.
You can use full path or wilcard to find wanted files.

```js
grunt.initConfig({
  yoctodoc : {
      options : {
        // change your path destination
        destination : 'Your_new_absolute_destination_path'
        copyExtraFiles : [ 'mayfile.myextension', './directory/myfile.extension', './directory/*.js' ]
      },
      // Set all your file here
      all : [ 'file.js', 'file2.js', 'file3.js', 'OR a path all js files are added' ]
    }
});
```

## How looks like the custom theme ?

See below kind of examples.

![Screen One](https://raw.githubusercontent.com/yoctore/yocto-doc/master/documentation/extras/Capture-1.png)

![Screen Two](https://raw.githubusercontent.com/yoctore/yocto-doc/master/documentation/extras/Capture-2.png)

![Screen Three](https://raw.githubusercontent.com/yoctore/yocto-doc/master/documentation/extras/Capture-3.png)

![Screen Four](https://raw.githubusercontent.com/yoctore/yocto-doc/master/documentation/extras/Capture-4.png)

![Screen Five](https://raw.githubusercontent.com/yoctore/yocto-doc/master/documentation/extras/Capture-5.png)