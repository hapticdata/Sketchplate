# Sketchplate
![Sublime Text 2 Plugin](http://haptic-data.com/sketchplate/sublime_scnsht1.png)

Sketchplate is a *scaffolding* system for quickly generating projects with a collection of libraries and processes that I use frequently for web-based computational design. These libraries are assembled together to work with the [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) workflow I prefer. It is packaged as an [NPM](http://npmjs.org) package for [Node.js](http://nodejs.org) and includes a basic plugin for easy use through [Sublime Text 2](http://sublimetext.com). Using Sketchplate allows you to instantly create a new project and begin working. **The goal of this project is to make the time between receiving inspiration and beginning development an absolute minimum.**


## Installation
* Move this repository into your Sublime Text 2 packages folder, on mac this is `~/Library/Application Support/Sublime Text 2/Packages`, restart Sublime Text 2.
* Set `DEFAULT_DIRECTORY` inside `sublime_create.py` to where you put your work (eventually this will be cleaner)

## Usage
Bring up your plugins panel `CMD + Shift + P` choose "Sketchplate: Create New Project" and enter your absolute directory below. Your application's starting point `javascripts/app/main.js` will automatically open in Sublime Text 2.


## Includes such fine libraries as:
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