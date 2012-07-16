import sublime, sublime_plugin, os, sys
import shutil, errno
import json
from pprint import pprint



class CreateSketchplateCommand(sublime_plugin.TextCommand):

	DEFAULT_DIRECTORY = "/Users/me/Sites/"

	def run(self, edit):
		#json_data = open('settings.json')
		#print json.dumps( json_data, sort_keys=True )
		#data = json.load( json_data )
		#json_data.close()
		#print(data["projectDirectory"])
		self.view.window().show_input_panel("Directory:", self.DEFAULT_DIRECTORY, self.on_done, None, None)
	def on_done(self, dir):
		sublime.status_message("Create project at " + dir)
		self.copyanything(sublime.packages_path() + "/Sketchplate/template", dir)
		sublime.status_message("Successfull created a new project in " + dir)
		window = self.view.window()
		window.open_file(dir+"/javascripts/app/main.js")

	def copyanything(self, src, dst):
		try:
			shutil.copytree(src, dst)
		except OSError as exc: # python >2.5
			if exc.errno == errno.ENOTDIR:
				shutil.copy(src, dst)
			else: raise
