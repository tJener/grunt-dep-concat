# grunt-dep-concat

Concatenate files in order based on dependencies.

## Getting Started

_If you haven't used [grunt][] before, be sure to check out the
[Getting Started][] guide._

From the same directory as your project's [Gruntfile][Getting Started]
and [package.json][], install this plugin with the following command:

```bash
npm install grunt-dep-concat --save-dev
```

Once that's done, add this line to your project's Gruntfile:

```js
grunt.loadNpmTasks('grunt-dep-concat');
```

If the plugin has been installed correctly, running `grunt --help` at
the command line should list the newly-installed plugin's task or
tasks. In addition, the plugin should be listed in package.json as a
`devDependency`, which ensures that it will be installed whenever the
`npm install` command is run.

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md
[package.json]: https://npmjs.org/doc/json.html
[tsort]: http://en.wikipedia.org/wiki/Tsort_%28Unix%29

## The “dep-concat” task

This plugin requires [tsort].

So you have a large number of files with implicit dependencies based
on the order in which you list them in your Gruntfile, and which must
be manually maintained. Don't we have new-fangled computer things to
sort this out for us? Add this to your source files:

```javascript
// load: some_loadtime_dependency.js

// run: a_runtime_dependency.js
/* run: another_runtime_dependency.js */
// run: a.js, long/list.js, of/runtime/dependencies.js

(function() {
  // …
}( SomeLoadtimeDependency ));
```

Then, instead of using the `concat` task, use the `depconcat` task.

```javascript
grunt.initConfig({
  depconcat: {
    dist: {
      src: ['src/**/*.js'],
      dest: 'dist/foo.js'
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History
* 2012/06/12 - v0.1.1 - Initial release.

## License
Copyright (c) 2012 Eric Li  
Licensed under the MIT license.
