/**
 * uglify file for ndp-video-spa on 16-Mar-16.
 */
module.exports = function (grunt, opt) {
    var scriptPath = 'app/scripts';
    var allfiles = function (cwd, dest, deep) {
        deep = !!deep;
        return {
            expand: true,
            cwd: cwd,
            src: deep ? ['**/*.js'] : ['*.js'],
            dest: dest,
            ext: '.js'
        }
    };
    var debugOpt = {
            mangle: false,
            beautify: true,
            compress: false,
            preserveComments: 'all',
            banner: '<%= banner %>\n'
        },
        minOpt = {
            screwIE8: true,
            sourceMap: true,
            mangle: true,
            compress: {
                dead_code: true,
                global_defs: {
                    "$SPA_DEBUG": false
                }
            },
            banner: '<%= banner %>'
        };

    return {
        debugAll: {
            options: debugOpt,
            files: [
                {
                    dest: "build/js/debug/data/configuration.js",
                    src: ['dist/configuration/**/**.js']
                },
                allfiles('app/scripts', 'build/js/debug'),
                allfiles('app/scripts/data', 'build/js/debug/data'),
                allfiles('app/scripts/misc', 'build/js/debug/misc', true),
                allfiles('app/scripts/views', 'build/js/debug/views', true),
                allfiles('dist/modules', 'build/js/debug/modules', true)
            ]
        },
        all: {
            options: minOpt,
            files: [
                {
                    dest: "build/js/data/configuration.js",
                    src: ['dist/configuration/**/**.js']
                },
                allfiles('app/scripts', 'build/js'),
                allfiles('app/scripts/data', 'build/js/data'),
                allfiles('app/scripts/misc', 'build/js/misc', true),
                allfiles('app/scripts/views', 'build/js/views', true),
                allfiles('dist/modules', 'build/js/modules', true)
            ]
        },
        legacy: {
            options: debugOpt,
            files: [
                allfiles('app/scripts/old', 'build/js/old', true)
            ]
        }
    }
};