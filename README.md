# Sketchplate
##pre-project tooling for getting started quick

There are currently 3 main components to sketchplate:

1.	[Templates](#templates)
1.	[Fetching](#fetching)
1.	[Hooks](#hooks)

Sketchplate is a system for quickly generating projects with collections of libraries and processes that you use frequently. It provides tools to maintain various templates, retrieve and update your favorite libraries, quickly copy your template into a specified folder and launch it in your favorite editor. It will be packaged on [NPM](http://npmjs.org) for [Node.js](http://nodejs.org).


## Installation
`$ git clone git@github.com:hapticdata/Sketchplate.git`

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


##Templates
Sketchplate encourages creating your own project templates and comes bundled with one called [amd-sketch](#amd-sketch). 

##Fetching
To assist in maintaining templates, a [template.json](./templates/amd-sketch/template.json) is used to describe resources, the retrieval and updating of those resources is automated and **doesn't use any package manager** _([Volo](http://github.com/jrburke/volojs), [Bower](http://github.com/twitter/bower))_. To use you simply describe where it is, and where you want its contents to go.
_currently supports **file**,**zip**,**clone**:_

###Download a file, copy it to the target:

	{
		"file": "https://raw.github.com/Modernizr/Modernizr/master/modernizr.js",
		"target": "js/vendor/modernizr.js"
	}

###_git clone_ a repository and copy its `src/dat` folder into `js/vendor/dat`:

	{
		"clone": "https://code.google.com/p/dat-gui/",
		"target": {
			"src/dat": "js/vendor/dat"
		}
	}

###Download a zip, extract it, copy its targets:

	{
		"zip": "https://github.com/twitter/bootstrap/zipball/master",
		"target": {
			"js/": "js/vendor/bootstrap",
			"less/": "less/bootstap"
		}
	}



##Hooks
Once a new project has been created there are several things you may want to do immediately.

1.	Open your editor to begin working
1.	Browse the newly created project
1.	Initialize an empty git repository
1.	run `npm install` to install node dependencies (if the template has a `package.json`)



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