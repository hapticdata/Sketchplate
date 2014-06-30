# Welcome to your sketchplate configuration


## `config.json` ([more](https://github.com/hapticdata/Sketchplate#config))
Configure your editor, paths and hooks.

## `fetch.json` ([more](https://github.com/hapticdata/Sketchplate#fetch))
Maintain bookmarks for your favorite libraries and how you get them from the internet to your project.


## Editors
Sketchplate defaults to using the bundled Orion browser-based editor. You will get the most from
sketchplate if you configure it to use your favorite editor. Add or configure your favorite editor
in `config.json`, or select from the existing configurations with:
 
```
sketchplate config editor
```

### Existing configurations


1. $EDITOR
1. atom
1. BBEdit (osx) (select install command-line support on welcome screen)
1. orion _(bundled with sketchplate)_
1. Sublime Text 2 (osx)
1. Sublime Text 3 (osx)
1. Sublime Text - in $PATH (run `subl` process)
1. Textmate (osx) ([install shell support](http://blog.macromates.com/2011/mate-and-rmate/))
1. Vim
1. Vim - in new terminal (osx)
1. WebStorm

**[Add many other editors easily.](https://github.com/hapticdata/Sketchplate#editors)**

You can also edit any of the configurations to use additional flags. The token `<%= workspace %>` will be replaced with the project path.

Your editors launch configuration has 3 properties:

* `cmd` the command to launch the editor, such as `vim`
* `args` an array of arguments to send the editor
* `cwd` the "current working directory" in which the editor should be launched from

Any of these variables can contain underscore `_.template()` variables, it will be provided an object such as:

```
{
    workspace: location, //the location of the project
    sketchplatePath: sketchplatePath, //the location of `sketchplate`
    process: process //process object, env variables in process.env
}
```
