# Sketchplate

**The goal of Sketchplate is to make the time between receiving inspiration and beginning development an absolute minimum.** Sketchplate is a system for quickly generating projects with a collection of libraries and processes that you use frequently. It provides tools to maintain various templates, retrieve and update your favorite libraries, quickly copy your template into a specified folder and launch it in your favorite editor. It will be packaged on [NPM](http://npmjs.org) for [Node.js](http://nodejs.org). Using Sketchplate allows you to instantly create a new project and begin working.


## Installation
`$git clone git@github.com:hapticdata/Sketchplate.git`

	Usage: sketchplate [options] [command]

	Commands:
		new [options]
		create a new project with sketchplate
		fetch [options]
		fetch copies of any missing resources for template
		config [options]
		set sketchplate configuration

	Options:
		-h, --help             output usage information
		-V, --version          output the version number
		-v, --verbose          Verbose
		-o, --open [location]  Open [location] in editor


Customize the [config.json](https://github.com/hapticdata/Sketchplate/blob/master/config.json) file for your editor and default template.  Edit the [templates/](https://github.com/hapticdata/Sketchplate/tree/master/template) folder however you like to customize your boilerplate. Each template has a simple [json description](https://github.com/hapticdata/Sketchplate/blob/master/templates/amd-sketch.json) that allows it to fetch resources.

##config.json

*	editorArgs {Array}, array of commands to launch editor into project, 
	project location will be appended as last command
*	template {String}, name of template to default to
*	templateDirectory {String}, location of Sketchplate's templates, relative to bin/

###Editor Arg examples:
* Sublime Text 2: `["subl"]`
*		This can be used on any platform that has Sublime Text 2 added to your $PATH
		by default Sublime Text 2 for OSX is set up through the /Applications directory 
* TextMate: `[ "mate", "-w" ]`
* Cloud9 (local install): `["c9", "-w" ]`
* BBEdit (command line tools must be installed): `["bbedit"]`

##Default template [amd-sketch](https://github.com/hapticdata/Sketchplate/blob/master/templates/)
The default template is oriented towards web-based computational design. I consider this analogous to a new sketch in [Processing](http://processing.org). These libraries are assembled together to work with the [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) workflow I prefer. 
### The default libraries in the template are:
* [Require.js](http://requirejs.org) - with [domReady](https://github.com/requirejs/domReady) and [text](https://github.com/requirejs/text) plugins bundled
* [jQuery](http://jquery.com)
* [dat-gui](http://code.google.com/p/dat-gui/)
* [toxiclibs.js](http://haptic-data.com/toxiclibsjs)
* [underscore.js](http://documentcloud.github.com/underscore/)
* [Backbone.js](http://documentcloud.github.com/backbone/)
* [Three.js](http://mrdoob.github.com/three.js/)
* [Stats.js](http://github.com/mrdoob/stats.js/)
* [d3](http://github.com/mbostock/d3)
* [modernizr](http://modernizr.com)

**All of these libraries are available in your project immediately, they are placed in a `javascripts/vendor` folder with a matching [require.js shim config](http://requirejs.org/docs/api.html#config-shim)**. Only resources that you reference in your project will ever be loaded or included in a built project. The output directory structure is setup to easily be moved into a [node.js](http://nodejs.org) + [express.js](http://expressjs.com) file structure

Created by [Kyle Phillips](http://haptic-data.com) on April 8th, 2012