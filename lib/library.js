var fs = require('graceful-fs'),
    _ = require('underscore'),
	fetch = require('./fetch');


/**
 * @expose
 * build the absolute paths to all `fetch` objects
 * and append utility methods for each resource
 * @param {string} templatePath the absolute path to the template directory.
 * @param {Object} fetches the object mapping all fetching processes (from the template.json).
 * @returns {Array} of the fetch resources
 */
module.exports = function buildLibrary( templatePath, fetches ){
    return _.chain( fetches )
        .map( addIdAttr )
        .map( _.partial(appendPathToTarget, templatePath) )
        .map(function addMethods( ftch ){
            //add utility methods
            ftch.exists = _.partial( targetsExist, ftch.target );
            ftch.fetch = _.partial( fetch, ftch );
            return ftch;
        })
        .value();
};

/**
 * @private
 * append an `id` attribute to every fetch object, based on its key
 * @param {Object} ftch the fetch object
 * @param {string} id the id of the resource
 * @returns {Object} the fetch object with an `id` attribute
 */
function addIdAttr(ftch, id){
    return _.extend({ id: id }, ftch);
}

/**
 * @private
 * append the `templatePath` to any `target`s
 * @param {string} templatePath the path to the template folder.
 * @param {Object} ftch the fetch object to perform
 * @returns {Object} the fetch object with all paths relative to template
 */
function appendPathToTarget( templatePath, ftch ){
    var prop;
    //if its a string, add the project root to its target
    if(typeof ftch.target === 'string'){
        ftch.target = templatePath + '/' + ftch.target;
    } else {
        //if its an object of targets, add the project root to each target
        for( prop in ftch.target ){
            ftch.target[prop] = templatePath + '/' + ftch.target[prop];
        }
    }
    return ftch;
}

/**
 * @private
 * does the `pth` exist?
 * @param {string} pth the file-path to look for.
 * @returns {boolean} true if exists.
 */
function exists( pth ){
    try {
        fs.statSync( pth );
    } catch ( e ){
        return false;
    }
    return true;
}

/**
 * @private
 * do all of the items in `target` exist?
 * @param {Object|string} target the fetch target to test
 * @returns {boolean} true if all exist
 */
function targetsExist( target ){
    //if its a single target
    if (typeof target === 'string'){
        return exists( target );
    } else {
        //multiple targets
        for (var prop in target){
            if( !exists(target[prop]) ){
                return false;
            }
        }
        return true;
    }
}

