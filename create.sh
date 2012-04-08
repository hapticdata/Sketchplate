
if [ $# -lt 1 ]; then echo "--Did not receive output directory--"
else	
	cp -r ./contents $1
	echo "--New Sketchplate project created in $1--"
fi