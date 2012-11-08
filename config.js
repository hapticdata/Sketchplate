({
	//SETUP EDITOR
	//**Command Array to launch editor**
	//the path to the project will be appended as the last argument
	
	//Default: Sublime Text 2 for Mac
	editorArgs: [
		"/Applications/Sublime Text 2.app/Contents/SharedSupport/bin/subl"
	],
	//Sublime Text 2 added to $PATH any OS
	//editorArgs: [ "subl" ],
	//Textmate
	//editorArgs: [ "mate" ],
	//BBEdit (command-line tools must be installed)
	//editorArgs: ["bbedit"],

	template: "amd-sketch",
	//relative to ./bin
	templateDirectory: "../templates"
})