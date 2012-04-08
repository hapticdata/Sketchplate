#!/bin/bash
# This tool will fetch the latest release of non-AMD javascript libraries
# and wrap them into working AMD modules
# idea taken from https://github.com/documentcloud/underscore/commit/0d4b1247c45083c695cab4242c084a97aa600221#commitcomment-857941



function amd_wrap {
	echo "\n -- updating $1 -- \n"
	if [ $# -le 3 ]; then echo "define(function(){\n//start wrap---" > $1
	else
		beforeDep="define(function(["
		afterDep="]){\n//start wrap---"
		echo "$beforeDep $4 $afterDep" > $1
	fi
	curl $2 >> $1
	before="//end wrap---\nvar exports = "
	after=";\nreturn exports;\n});"
	finalString="$before $3$after"
	echo  $finalString >> $1
}

# resulting file | file url | variable to export | [ optional: dependencies ]
amd_wrap "javascripts/underscore.js" "https://raw.github.com/documentcloud/underscore/master/underscore.js" "_.noConflict()"
amd_wrap "javascripts/backbone.js" "https://raw.github.com/documentcloud/backbone/master/backbone.js" "Backbone.noConflict()" "'jquery','underscore'"
#Bring THREE.js into AMD, but leave it global also
amd_wrap "javascripts/three.js" "https://raw.github.com/mrdoob/three.js/master/build/Three.js" "THREE; window.THREE = THREE"
amd_wrap "javascripts/Stats.js" "https://raw.github.com/mrdoob/stats.js/master/build/Stats.js" "Stats"