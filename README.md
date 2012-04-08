# Sketchplate
Sketchplate is a collection of libraries and processes that I use frequently assembled together to work well with the AMD workflow I prefer. It is packaged as a [Sublime Text 2](http://sublimetext.com) plugin that allows you to instantly create a new project and begin working. My hope is to decrease the amount of time between initial inspiration and coding to an absolute minimum.


## Installation
* Move this repository into your Sublime Text 2 packages folder, on mac this is `~/Library/Application Support/Sublime Text 2/Packages`, restart Sublime Text 2.
* Set `DEFAULT_DIRECTORY` inside `sublime_create.py` to where you put your work (eventually this will be cleaner)

## Usage
Bring up your plugins panel `CMD + Shift + P` choose "Sketchplate: Create New Project" and enter your absolute directory below. Your application's starting point `javascripts/app/main.js` will automatically open in Sublime Text 2.


## Additional Features
* `amdify.sh` curls the latest build files for non-AMD libraries and wraps them in an AMD `define()` statement
* `create.sh` allows you to create a new Sketchplate project without Sublime Text 2
* directory structure is setup to easily be moved into a [node.js](http://nodejs.org) + [express.js](http://expressjs.com) file structure


## Includes such fine libraries as:
* [Require.js](http://requirejs.org)
* [jQuery](http://jquery.com)
* [dat.GUI](http://code.google.com/p/dat-gui/) - [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)
* [toxiclibs.js](http://haptic-data.com/toxiclibsjs)
* [underscore.js](http://documentcloud.github.com/underscore/) - AMD-wrapped
* [Backbone.js](http://documentcloud.github.com/backbone/) - AMD-wrapped
* [Three.js](http://mrdoob.github.com/three.js/) - AMD-wrapped (still exposed to `window`)
* [Stats.js](http://github.com/mrdoob/stats.js/) - AMD-wrapped

Because this structure uses AMD, none of these libraries are assumed to be used, they will only be loaded if explicitly required as a dependency.


I should note that this is an experiment and this is the first Sublime Text 2 plugin I've written. I'm not much for python or bash.

Created by [Kyle Phillips](http://haptic-data.com) on April 8th, 2012