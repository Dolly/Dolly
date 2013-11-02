module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
        watch: {
            scripts: {
                files: ['src/**/*.ts'],
                tasks: ['typescript', 'copy'],
                options: {
                    spawn: false
                }
            }
        },
		typescript: {
			base: {
				src: ['src/**/*.ts'],
				dest: 'bin',
				options: {
					module: 'commonjs', //or commonjs
					target: 'es5', //or es3
					base_path: 'src',
					sourcemap: false,
					fullSourceMapPath: false,
					declaration: false
				}
			}
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: 'src/plugins',
						src: ['**'],
						dest: 'bin/plugins/'
					}
				]
			}
		},
		mochacli: {
			test: 'tests/**/*_test.js'
		}
	});

    grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-mocha-cli');

	// Default task(s).
	grunt.registerTask('default', ['typescript', 'copy']);
	grunt.registerTask('test', ['mochacli']);

};
