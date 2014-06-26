var wrench = require('wrench');

/**
 * remove a template from the templates directory
 * @param {object} settings the settings object describing where the `templatePath` is located
 * @param {string} name the name of the template to remove.
 * @param {Function} fn( error ) the callback.
 */
module.exports = function removeTemplate( settings, name, fn ){
	var tmplDir = settings.templatesPath +'/'+name;
	wrench.rmdirRecursive( tmplDir, fn );
};
