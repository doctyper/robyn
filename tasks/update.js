/*jshint node:true*/
module.exports = function (grunt) {
	"use strict";

	grunt.registerTask("update", "Update the boilerplate", function (plugin) {
		var done = this.async();
		var helpers = require("./helpers/help")(grunt);

		var pkg = require("./utils/pkg");

		// Sanity check
		pkg.repository = pkg.repository || {};

		// Set plugin if not deflined
		plugin = plugin || pkg.name;

		var branch;
		var bits = plugin.split("@");

		if (bits.length === 1) {
			plugin = bits[0];
		} else {
			plugin = bits[0];
			branch = bits[1];
		}

		branch = branch || pkg.repository.branch || "master";

		if (plugin === pkg.name) {
			helpers.spawn({
				cmd: "git",
				args: ["submodule", "foreach", "git", "pull", "origin", branch],
				title: "Updating %s".replace("%s", pkg.config.dirs.robyn),
				complete: function (code) {
					if (code !== 0) {
						done(false);
					}

					done();
				}
			});
		} else {
			grunt.task.run("install:%p@%b:update".replace("%p", plugin).replace("%b", branch));
			done();
		}
	});

};
