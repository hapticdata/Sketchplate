var fs = require('fs-extra'),
    path = require('path');

/**
 * remove a template from the templates directory
 * @param {object} settings the settings object describing where the `templatePath` is located
 * @param {string} name the name of the template to remove.
 * @param {Function} fn( error ) the callback.
 */
module.exports = function removeTemplate( settings, name, fn ){
	var tmplDir = path.join(settings.templatesPath, name);
    fs.remove(tmplDir, fn);
};
