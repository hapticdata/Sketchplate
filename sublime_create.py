import sublime, sublime_plugin, os, sys
import shutil, errno



class CreateSketchLibsCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		self.view.window().show_input_panel("Directory:","/Users/me/Sites/",self.on_done, None, None)
	def on_done(self, dir):
		sublime.status_message("Create project at " + dir)
		self.copyanything(sublime.packages_path() + "/SketchLibs/contents", dir)
		sublime.status_message("Successfull created a new project in " + dir)
		self.view.window().open_file(dir+"/javascripts/app/main.js")

	def copyanything(self, src, dst):
		try:
			shutil.copytree(src, dst)
		except OSError as exc: # python >2.5
			if exc.errno == errno.ENOTDIR:
				shutil.copy(src, dst)
			else: raise
