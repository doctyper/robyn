/*jshint node:true*/
module.exports = function (grunt) {
	"use strict";

	grunt.registerMultiTask("build", "Build your project.", function () {
		var done = this.async();
		var helpers = require("./helpers/help")(grunt);

		this.requiresConfig("build");

		helpers.checkInitialized(function (initialized) {
			var tasks = [];

			if (!initialized) {
				tasks.push("start");
			}

			if (typeof this.data === typeof []) {
				tasks = tasks.concat(this.data);
			} else {
				tasks.push(this.data);
			}

			grunt.task.run(tasks);

			done();
		}.bind(this));

	});

};
