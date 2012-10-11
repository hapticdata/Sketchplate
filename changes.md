#Changes

#v0.0.4
-	started change log :)
-	updated readme
-	resolved issues where path to templates folder was incorrect
-	`lib/fetch.js` now cleans up after git repos that happen to fail during clone (such as if connection drops)
-	altered templates structure
-	added `--npminstall` to `sketchplate new`
-	added `--browse` to `sketchplate new`
-	added `mkdirp` for creating nested directories in fetch targets
-	throws an understandable error when trying to use a non-existant template