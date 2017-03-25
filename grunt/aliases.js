/**
 * aliases file for ndp-video-spa on 16-Mar-16.
 */
module.exports = {
    'default': {
        description: 'Default (development) build',
        tasks: ['dev', 'express', 'watch']
    },
    merge:{
        description: 'Merge and Update Scripts Files',
        tasks: ['clean','concat','uglify']
    },
    dev: {
        description: 'Development build',
        tasks: ['concurrent:first', 'concurrent:second', 'concurrent:third']
    },
    prod: {
        description: 'Production build',
        tasks: []
    }
};
