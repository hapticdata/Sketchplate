#Changes

##v0.0.5
-	`sketchplate config templateDirectory [directory]` for setting a different folder to contain templates
-	`sketchplate config template [template]` for setting a different default template
-	`config.templateDirectory` is now `config.templatesPath`
-	"url" fetches are now referred to as "file" fetches
-	asks user to edit config when editor does not appear to be setup correctly
-	`sketchplate fetch jquery async three` fetch individual resources for a template by name
-	`sketchplate fetch -i` for fetching resources with interactive mode
-	`sketchplate template --new` for creating a new template
-	support for fetching zip archives
-	support for multiple targets with a fetched resource
-	properly checking for multiple targets
-	allowing errors to bubble up `bin/sketchplate` instead of throwing errors earlier
-	collecting and reporting of errors for failed git, zip or file fetches

##v0.0.4
-	started change log :)
-	updated readme
-	resolved issues where path to templates folder was incorrect
-	`lib/fetch.js` now cleans up after git repos that happen to fail during clone (such as if connection drops)
-	altered templates structure
-	added `--npminstall` to `sketchplate new`
-	added `--browse` to `sketchplate new`
-	added `mkdirp` for creating nested directories in fetch targets
-	throws an understandable error when trying to use a non-existant template