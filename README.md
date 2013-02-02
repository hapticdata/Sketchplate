# Sketchplate
##pre-project tooling for getting started quick

Sketchplate is a system for quickly generating projects with the collections of libraries and processes that you use frequently. It provides tools to maintain various templates, retrieve and update your favorite libraries, quickly copy your template into a specified folder and launch it in your favorite editor. It is published on [NPM](http://npmjs.org) for [Node.js](http://nodejs.org). Sketchplate currently supports OSX. Support for Linux and Windows is in future plans.

There are currently 3 main components to sketchplate:

1.	[Templates](#template) - create and manage your own templates
1.	[Fetching](#fetch) - manage and automate retrieval of external resources
1.	[Hooks](#hooks) - express execution of common tasks after project creation

##Installation
	$ npm install -g sketchplate

##Creating your first new project
	$ sketchplate new ./my-sketchplate-project

##CLI Interface

	  Usage: sketchplate <command> [options]

Options:

		-h, --help     output usage information
		-V, --version  output the version number

Commands:

-	[new](#new) [options] <location> - create a new project at \<location\> with hooks for [options]
-	[template](#template) [options] [command] - perform commands on your sketchplate templates
-	[fetch](#fetch) [options] [names…] - perform resource fetches on your projects and templates
-	[hooks](#hooks) [options] [location] - perform any of the hooks on existing projects
-	[config](#config) [options] [command] - edit your sketchplate configuration


##new
Specify the location for the new project and any combinations of [hooks](#hooks) to perform upon completion.
*In this example the user has their editor set up as Sublime Text 2, the current default editor*

  Usage: sketchplate-new [options] <location>

  Options:

    -h, --help                 output usage information
    -b, --browse               Open project in file browser
    -e, --editor               Launch project in editor "Sublime Text 2 (osx)"
    -g, --git-init             Initialize a git repository
    -n, --npm-install          Run npm install
    -s, --server [port]        Start a static file server with connect on [port]
    -t, --template [template]  Create with [template] template


##template

  Usage: sketchplate template [options] [command]

  Commands:

    new [options] [name]
    create a new template

    edit [options] [name]
    edit an existing template

    fetch [options] [names…]
    fetch resources for a template

    list
    list all of the installed templates

    remove <name>
    remove an existing template

    set <name>
    set the default template, currently `node-server`

  Options:

    -h, --help  output usage information

##fetch

	Usage: sketchplate fetch <command> [names…]

There is a global `fetch.json` which you can use to add urls to resources you wish to keep track of and add to any project. The retrieval and updating of those resources is automated and **doesn't use any package manager** _([Volo](http://github.com/jrburke/volojs), [Bower](http://github.com/twitter/bower))_.
Use in an existing project with: `sketchplate fetch add [id1] [id2]` or `-i` for interactive mode. To assist in maintaining the dependencies of your templates, a [template.json](./templates/amd-sketch/template.json) is used. The `sketchplate template fetch` command is used to update your templates resources.

  Usage: sketchplate fetch [options] [command]

  Commands:

    add [options]
    add fetched resources to your project

  Options:

    -h, --help  output usage information
    -e, --edit  Edit fetch.json in your editor


To use, you simply describe where it is, and where you want its contents to go.
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
Once a new project has been created there are several things you may want to do immediately or any future time you are working with that project, I call these Hooks. Each of these are available as options on `sketchplate new [options] <location>` 
or can be used relative to your current directory with `sketchplate hooks [options]`

    Usage: sketchplate hooks [options]

    Options:

    -h, --help                 output usage information
    -b, --browse               Open project in file browser
    -e, --editor               Launch project in editor "Sublime Text 2 (osx)"
    -g, --git-init             Initialize a git repository
    -n, --npm-install          Run npm install
    -s, --server [port]        Start a static file server with connect on [port]
    -t, --template [template]  Create with [template] template

run any combination of these hooks. These are also available for `sketchplate new` `sketchplate template add` and `sketchplate template edit`.
For example, This will open `./www` in you configured editor, initialize a git repository, open the folder in Finder and start serving it on port 8080:

	sketchplate hooks ./www -egb -s 8080

##Config

	Usage: sketchplate config [options] [command]

	Commands:

	editor [options] 
	setup your editor
	
	templates <path>
	change the directory of your templates, currently `../templates`

	Options:

	-h, --help  output usage information
	-e, --edit  Edit the config.json in your editor


###Editors
Set your editor to one of the following with:

	sketchplate config editor

1. Sublime Text 2 (osx)
1. Textmate (osx) ([install shell support](http://blog.macromates.com/2011/mate-and-rmate/))
1. BBEdit (osx) (select install command-line support on welcome screen)
1. WebStorm (osx)
1. Vim (osx)
1. Sublime Text 2 $PATH (subl) - launch ST2 on a computer where `subl` has been added to $PATH

**Add many other editors easily.** Say you have [coda-cli](http://justinhileman.info/coda-cli/) (or [Command-Line-Coda](https://github.com/egonSchiele/Command-Line-Coda)) installed and want to use Coda as your editor:

1.	launch your config.json in your editor with `sketchplate config`
1.	add `"coda": ["coda", "%path"]` to the `"editors"`
1.	change `"editor"` to `"coda"`

You can also edit any of the editors to use additional flags. The token `%path` will be replaced with the project path.



##Default template [amd-sketch](https://github.com/hapticdata/Sketchplate/blob/master/templates/)
The default template is of minimal structure and is oriented towards web-based computational design sketches. These libraries are assembled together to work with the [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) workflow I prefer. 
### The default libraries in the template are:
* [Require.js](http://requirejs.org) - with [domReady](https://github.com/requirejs/domReady) and [text](https://github.com/requirejs/text) plugins bundled
* [jquery](http://jquery.com)
* [dat-gui](http://code.google.com/p/dat-gui/)
* [toxiclibsjs](http://haptic-data.com/toxiclibsjs)
* [underscore.js](http://documentcloud.github.com/underscore/)
* [backbone.js](http://documentcloud.github.com/backbone/)
* [three.js](http://mrdoob.github.com/three.js/)
* [Stats.js](http://github.com/mrdoob/stats.js/)
* [d3](http://github.com/mbostock/d3)
* [modernizr](http://modernizr.com)

All of these libraries will be fetched the first time automatically, they are placed in a `javascripts/vendor` folder with a matching [configuration file](https://github.com/hapticdata/Sketchplate/blob/master/templates/amd-sketch/template/javascripts/config.js) ([ more about require.js shim config](http://requirejs.org/docs/api.html#config-shim) ). Only resources that you reference in your project will ever be loaded or included in a built project. The output directory structure is setup to easily be moved into a [node.js](http://nodejs.org) + [express.js](http://expressjs.com) file structure

Created by [Kyle Phillips](http://haptic-data.com) on April 8th, 2012
