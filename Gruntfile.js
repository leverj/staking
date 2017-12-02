module.exports = function (grunt) {
  // Project configuration.
  const dist = './dist1/';
  const server = './src-admin/server/';
  const common = './src-admin/common/';
  const client = './src-admin/client/';
  const contracts = './build/';

  grunt.initConfig(
    {
      pkg: grunt.file.readJSON('package.json'),
      clean: {dist: [dist, "./migrations/config"]},
      exec: {compile: "truffle compile"},
      copy: {
        main: {
          files: [
            {
              expand: true,
              cwd: client,
              src: ['**/*'],
              dest: dist + "/src-admin/client"
            },
            {
              expand: true,
              cwd: ".",
              src: ["package.json"],
              dest: dist
            },
            {
              expand: true,
              cwd: server,
              src: ['**/*'],
              dest: dist + "/src-admin/server"
            }/*,
            {
              expand: true,
              cwd: 'bower_components',
              src: ['**!/!*'],
              dest: dist + "/src-admin/client"
            }*/,
            {
              expand: true,
              cwd: contracts,
              src: ['**/*'],
              dest: dist + "/build"
            },
            {
              expand: true,
              cwd: "./config",
              src: ['**/*'],
              dest: dist + "/config"
            }
          ]
        }
      },
      /*cachebreaker: {
        dev: {
          options: {
            match: [
              {"bootstrap.min.css": "dist1/src/client/bootstrap/dist/css/bootstrap.min.css"},
              {"main.css": "dist1/src/client/coinpit.css"},
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
            "dist1/src-admin/client/admin.js": client + "admin.js",
            "dist1/src-admin/client/index.js": client + "index.js"
          }
        }
      },
      watch: {
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

  grunt.registerTask('default', ['clean', 'exec', 'copy', 'browserify']);
};
