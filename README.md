# yocto-doc


> Generate documention for source. Build from jsDoc & jaguarjs tools

## How to use

> In your project install our plugin

```shell
# If you install from npm registry
npm install yocto-doc --save-dev
```

```shell
# If your install from yocto lab. Add this line on your package.json
{
    "yoctohint" : "git+ssh://git@lab.yocto.digital:yocto-node-modules/yocto-doc.git"
}
```
### Overview & Options
In your project's Gruntfile, add a section named `yoctodoc` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  yoctodoc : {
      options : {
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

Run IT 

```shell
grunt doc

// Data will output on documentation directory on your current project path
```