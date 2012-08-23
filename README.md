[![build status](https://secure.travis-ci.org/tJener/grunt-dep-concat.png)](http://travis-ci.org/tJener/grunt-dep-concat)
# grunt-dep-concat

Concatenate files in order based on dependencies.

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-dep-concat`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-dep-concat');
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
[tsort]: http://en.wikipedia.org/wiki/Tsort_%28Unix%29

## Documentation
This plugin requires [tsort].

So you have a large number of files with implicit dependencies based on the order in which you list them in your gruntfile, and which must be manually maintained. Don't we have new-fangled computer things to sort this out for us? Add this to your source files:

```javascript
// load: some_loadtime_dependency.js

// run: a_runtime_dependency.js
/* run: another_runtime_dependency.js */
// run: a.js, long/list.js, of/runtime/dependencies.js

(function() {
  // …
}( SomeLoadtimeDependency ));
```

Then, instead of using the `concat` task, use the `depconcat`.

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
