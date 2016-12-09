'use strict';

module.exports = function (grunt) {

  require('jit-grunt')(grunt);

  var config = {
    src: 'src',
    dist: 'dist'
  };

  grunt.initConfig({

    config: config,

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

    datauri: {
      default: {
        options: {
          classPrefix: 'icon-'
        },
        src: [
          'icons/*'
        ],
        dest: [
          '.tmp/_icons.scss'
        ]
      }
    },

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
    }

  });

  grunt.registerTask('build', [
    'clean:dist',
    'datauri',
    'sass',
    'postcss',
    'cssmin',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
