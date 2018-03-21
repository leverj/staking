module.exports = function (grunt) {
  // Project configuration.
  const dist      = './dist/';
  const server    = './src/server/';
  const client    = './src/client/';
  const contracts = './build/';
  const config    = './config'

  grunt.initConfig(
    {
      pkg             : grunt.file.readJSON('package.json'),
      clean           : {dist: [dist, "./migrations/config"]},
      exec            : {compile: "truffle compile"},
      copy            : {
        main: {
          files: [
            {
              expand: true,
              cwd   : client,
              src   : ['**/*'],
              dest  : dist + "/src/client"
            },
            {
              expand: true,
              cwd   : ".",
              src   : ["package.json"],
              dest  : dist
            },
            {
              expand: true,
              cwd   : server,
              src   : ['**/*'],
              dest  : dist + "/src/server"
            },
            {
              expand: true,
              cwd   : contracts,
              src   : ['**/*'],
              dest  : dist + "/build"
            },
            {
              expand: true,
              cwd   : config,
              src   : ['**/*'],
              dest  : dist + "/config"
            }

          ]
        }
      },
      "string-replace": {
        inline: {
          files  : {'./': 'node_modules/web3-core-requestmanager/src/givenProvider.js'},
          options: {
            replacements:
              [{
                pattern    : 'var global = Function(\'return this\')();',
                replacement: '// var replaced global = Function(\'return this\')();'
              }]
          }
        }
      },

      /*cachebreaker: {
        dev: {
          options: {
            match: [
              {"bootstrap.min.css": "dist/src/client/bootstrap/dist/css/bootstrap.min.css"},
              {"main.css": "dist/src/client/coinpit.css"},
              {"coinpit.js": "dist/src/client/coinpit.js"},
              {"chart.js": "dist/src/client/chart.js"},
            ],
            replacement: 'md5'
          },
          files: {src: ['dist/src/client/index.html']}
        }
      },*/
      browserify: {
        dist: {
          files: {
            "dist/src/client/js/admin.js": client + "js/admin.js",
            "dist/src/client/js/index.js": client + "js/index.js"
          }
        }
      },
      watch     : {
        s1: {
          files: [client + "/**"],
          tasks: ['copy', 'browserify']
        }
      }
    });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.registerTask('default', ['clean', 'string-replace', 'exec', 'copy', 'browserify']);
};
