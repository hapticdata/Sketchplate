# Sketchplate

Sketchplate is a system for quickly generating projects with a collection of libraries and processes that I use frequently for web-based computational design. It provides tools to maintain a template folder, retrieve and update your favorite libs and quickly copy your template into a new folder you specify. These libraries are assembled together to work with the [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) workflow I prefer. It will be packaged as an [NPM](http://npmjs.org) package for [Node.js](http://nodejs.org). Using Sketchplate allows you to instantly create a new project and begin working. **The goal of this project is to make the time between receiving inspiration and beginning development an absolute minimum.**


## Installation
`$git clone git@github.com:hapticdata/Sketchplate.git`

## Usage
`$./sketchplate --new ~/Sites/my_project`

  Options:

    -u, --update             	Update libraries
    -o, --open [location]     	Open [location] in editor
    -n, --new [location]  		New project at [location]


Customize the [settings.json](https://github.com/hapticdata/Sketchplate/blob/dev-node/settings.json) file with your favorite libraries, edit the [template/](https://github.com/hapticdata/Sketchplate/tree/dev-node/template) folder however you like.


## The default libraries in the template are:
* [Require.js](http://requirejs.org) - with [domReady](https://github.com/requirejs/domReady) and [text](https://github.com/requirejs/text) plugins bundled
* [jQuery](http://jquery.com)
* [dat-gui](http://code.google.com/p/dat-gui/)
* [toxiclibs.js](http://haptic-data.com/toxiclibsjs)
* [underscore.js](http://documentcloud.github.com/underscore/)
* [Backbone.js](http://documentcloud.github.com/backbone/)
* [Three.js](http://mrdoob.github.com/three.js/)
* [Stats.js](http://github.com/mrdoob/stats.js/)
* [d3](http://github.com/mbostock/d3)

**All of these libraries are available in your project immediately, they are placed in a `javascripts/vendor` folder with a matching [require.js shim config](http://requirejs.org/docs/api.html#config-shim)**. Only resources that you reference in your project will ever be loaded or included in a built project. The output directory structure is setup to easily be moved into a [node.js](http://nodejs.org) + [express.js](http://expressjs.com) file structure

Created by [Kyle Phillips](http://haptic-data.com) on April 8th, 2012