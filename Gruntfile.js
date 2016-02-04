'use strict';

module.exports = function (grunt) {

  require('jit-grunt')(grunt);

  // Configurable paths
  var config = {
    src: 'src',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>',
          src: '*.{scss,sass}',
          dest: '<%= config.dist %>',
          ext: '.min.css',
          extDot: 'last'
        }]
      }
    },

    postcss: {
      options: {
        map: true,
        processors: [
          // Add vendor prefixed styles
          require('autoprefixer')({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
          })
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: '*.css',
          dest: '<%= config.dist %>'
        }]
      }
    },

    cssmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: '*.css',
          dest: '<%= config.dist %>'
        }]
      }
    },

    uglify: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>',
          src: '*.js',
          dest: '<%= config.dist %>',
          ext: '.min.js',
          extDot: 'last'
        }]
      }
    },

  });

  grunt.registerTask('build', [
    'clean:dist',
    'sass',
    'postcss',
    'cssmin',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
