/*global module:false*/
module.exports = function (grunt) {

	grunt.registerTask("install", "Install a plugin", function (plugin, isUpdate) {
		var pkg = require("./utils/pkg");
		var colors = require("colors");
		var done = this.async();

		grunt.helper("check_initialized", function (initialized) {
			if (!initialized) {
				done(false);
			}
		});

		grunt.helper("check_for_available_plugins", function (plugins) {
			var i, j, current;
			var available = [];
			var installed = [];
			var plug;

			for (i = 0, j = plugins.length; i < j; i++) {
				current = plugins[i];

				if (!pkg.installedPlugins[current]) {
					available.push(current);
				} else {
					plug = pkg.installedPlugins[current];
					plug.name = current;

					installed.push(plug);
				}
			}

			var showPlugins = function (showHelp) {
				if (showHelp) {
					grunt.log.writeln();
					grunt.log.writeln("Install plugins with grunt install:my-plugin-name");
				}

				grunt.log.writeln();
				grunt.log.writeln("[*] ".cyan + "Installed plugins:".magenta);

				if (installed.length) {
					var plug;

					for (i = 0, j = installed.length; i < j; i++) {
						plug = installed[i];

						grunt.log.writeln("[+] ".grey + "%n %v".replace("%n", plug.name).replace("%v", plug.version).cyan + " (%d)".replace("%d", plug.description).grey);
					}
				} else {
					grunt.log.writeln("You haven't installed any plugins!".grey);
				}

				grunt.log.writeln();
				grunt.log.writeln("[*] ".cyan + "Available plugins:".magenta);

				if (available.length) {
					for (i = 0, j = available.length; i < j; i++) {
						grunt.log.writeln("[+] ".grey + available[i].cyan);
					}
				} else {
					grunt.log.writeln("You've installed all available plugins!".grey);
				}
			};

			var resetGit = function (err) {
				var cp = require("child_process");

				var child = cp.spawn("git", ["reset", "--hard", "HEAD"], {
					cwd: pkg.dirs.robyn,
					stdio: "pipe"
				});

				child.on("exit", function () {
					done(err);
				});
			};

			if (!plugin) {
				showPlugins(true);
				done();
			}

			var cleanPlugin = plugin.split("@")[0];

			if ((plugins.indexOf(cleanPlugin) === -1) && (pkg && (cleanPlugin !== pkg.name))) {
				showPlugins();

				grunt.log.writeln();
				grunt.fail.warn(plugin.red.bold + " is not an available plugin".yellow);
			}

			grunt.helper("install_plugin", plugin, isUpdate, function (stop) {
				if (stop === true) {
					resetGit(false);
				} else {
					if (isUpdate) {
						var path = require("path");
						var updatePath = path.join(__dirname, "./utils/on-update");

						delete require.cache[updatePath + ".js"];

						var update = require(updatePath);
						update.run(function () {
							resetGit();
						});
					} else {
						resetGit();
					}
				}
			});
		});
	});

};