/*global module:false*/

module.exports = function (grunt) {

	grunt.registerTask("start", "Get your party started", function (branch, override) {
		var fs = require("fs");
		var cp = require("child_process");
		var path = require("path");

		var done = this.async();

		var pkg = require("./utils/pkg");

		// Don't require until we know we need it
		var localPkg;

		var whitelist = [];

		var prompt;
		var remote;

		var projectName = pkg.vars.PROJECT_NAME;
		var projectTitle = pkg.vars.PROJECT_TITLE;

		var options = [{
			name: "name",
			message: "Project name?",
			validator: /^([a-z]+)(\w+)$/,
			warning: "Invalid namespace. Valid characters are [a-Z]. Must start with a lowercase",
			"default": projectName || "sampleProjectName"
		}, {
			name: "title",
			message: "Project title?",
			"default": projectTitle || "Sample Project Title"
		}];

		var finalizeInstall = function () {
			pkg.initialized = true;
			pkg.save();

			grunt.log.writeln();
			grunt.log.writeln("[*] " + "You should edit your package.json and fill in your project details.".cyan);
			grunt.log.writeln("[*] " + "All done! Commit you changes and you're on your way.".cyan);

			done();
		};

		var resetGit = function () {
			var child = cp.spawn("git", ["reset", "--hard", "HEAD"], {
				cwd: pkg.dirs.robyn,
				stdio: "pipe"
			});

			child.on("exit", finalizeInstall);
		};

		var handleSettings = function(err, props, overrideProps) {
			var key;

			for (key in overrideProps) {
				props[key] = overrideProps[key];
			}

			var name = props.name;
			var title = props.title;

			delete props.name;
			delete props.title;

			var plugArr = whitelist;
			var i = 0;

			for (key in props) {
				var assert = grunt.helper("get_assertion", props[key]);

				if (assert) {
					plugArr.push(key);
				}
			}

			// Sort by name
			plugArr = plugArr.sort();

			grunt.helper("store_vars", name, title, function () {
				grunt.log.writeln("[*] " + "Stored and updated your project variables.".cyan);

				(function install (count) {
					if (!plugArr[count]) {
						resetGit();
						return;
					}

					grunt.helper("install_plugin", plugArr[count], null, function (stop) {
						if (stop === true) {
							done(false);
							return;
						}

						count++;

						if (plugArr[count]) {
							install(count);
						} else {
							resetGit();
						}
					});
				}(i));

			});
		};

		var promptForSettings = function (plugins) {
			var i, j, plugin,
				installed = pkg.installedPlugins;

			if (installed) {
				var plugTitle;

				for (var key in installed) {
					if (!plugTitle) {
						grunt.log.writeln();
						grunt.log.writeln("[*] ".cyan + "Installed plugins:".magenta);
						plugTitle = true;
					}

					var plug = installed[key];

					if (typeof plug !== "string") {
						grunt.log.writeln("[+] ".grey + "%n %v".replace("%n", key).replace("%v", plug.version).cyan + " (%d)".replace("%d", plug.description).grey);
					} else {
						grunt.log.writeln("[+] ".grey + key.cyan + " (%d)".replace("%d", plug).grey);
					}
				}
			}

			var pluginOpts = [];
			var overrideOpts = [];
			var overrideProps = {};

			for (i = 0, j = plugins.length; i < j; i++) {
				plugin = plugins[i];

				if (!installed || !installed[plugin]) {
					pluginOpts.push({
						name: plugin,
						message: "Would you like to include %s?".replace("%s", plugin),
						validator: /[y\/n]+/i,
						"default": "Y/n"
					});
				}
			}

			if (override) {
				var assert = "y";

				if (override === "bare") {
					assert = "n";
				}

				override = override.split(",");

				for (i = 0, j = pluginOpts.length; i < j; i++) {
					if (override.length > 1) {
						assert = (override.indexOf(pluginOpts[i].name) !== -1) ? "y" : "n";
					}

					overrideProps[pluginOpts[i].name] = assert;
				}

				pluginOpts = [];
			}

			grunt.helper("prompt", {}, options.concat(pluginOpts), function (err, props) {
				handleSettings(err, props, overrideProps);
			});
		};

		var gatherPlugins = function () {
			grunt.helper("check_for_available_plugins", promptForSettings);
		};

		var getThisPartyStarted = function () {
			if (pkg.initialized) {
				grunt.log.writeln();
				grunt.log.writeln("[*] " + "This party's already been started. You can install individual plugins with `grunt install`".cyan);

				done();
			} else {
				prompt = require("prompt");
				prompt.message = (prompt.message !== "prompt") ? prompt.message : "[?]".white;
				prompt.delimiter = prompt.delimter || " ";

				grunt.log.writeln();

				grunt.utils.spawn({
					cmd: "git",
					args: ["status"]
				}, gatherPlugins);
			}
		};

		var runInitializeScripts = function (i) {
			i = (i || 0);

			if (!pkg.scripts || !pkg.scripts.install || !pkg.scripts.install[i]) {
				return getThisPartyStarted();
			}

			var initScript = pkg.scripts.install[i];
			var args = initScript.split(" "),
				cmd = args.shift(),
				file = args.join("");

			if (cmd === "node" && fs.existsSync("./" + file)) {
				grunt.log.subhead(args);

				var initializer = require(fs.realpathSync(file));

				initializer.run(function (error) {
					if (error) {
						grunt.fail.warn(error);
					}

					runInitializeScripts(++i);
				});
			} else {
				runInitializeScripts(++i);
			}
		};

		var checkIfPartyStarted = function () {
			// Make sure default paths exist
			var dirs = pkg.dirs,
				key, dir;

			for (key in dirs) {
				dir = path.join(process.cwd(), dirs[key]);

				if (!fs.existsSync(dir)) {
					grunt.file.mkdir(dir);
				}
			}

			localPkg = require("./utils/local-pkg");

			var requiredPaths = pkg.requiredPaths,
				i, j, req;

			for (i = 0, j = requiredPaths.length; i < j; i++) {
				if (!fs.existsSync("./" + requiredPaths[i])) {
					localPkg.initialized = false;
				}
			}

			if (localPkg.initialized === true) {
				getThisPartyStarted();
			} else {
				localPkg.initialized = true;

				localPkg.save();
				runInitializeScripts();
			}
		};

		var checkSystemDependencies = function (sysDeps) {
			if (sysDeps) {
				grunt.helper("check_dependencies", sysDeps, function (name) {
					checkIfPartyStarted();
				}, function (error) {
					done(error);
				});
			} else {
				checkIfPartyStarted();
			}
		};

		var installNPMModules = function () {
			var child = cp.spawn("npm", ["install", "--production"], {
				env: null,
				setsid: true,
				stdio: "inherit"
			});

			child.addListener("exit", function () {
				checkSystemDependencies(pkg.systemDependencies);
			});
		};

		(function () {
			installNPMModules();
		}());

	});

};