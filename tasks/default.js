/*jshint node:true*/
module.exports = function (grunt) {
	"use strict";

	// Default task.
	grunt.registerTask("default", function () {
		var done = this.async();
		var helpers = require("./helpers/help")(grunt);

		var tasks = ["info"];

		helpers.checkInitialized(function (initialized) {
			if (!initialized) {
				tasks.unshift("start");
			}

			grunt.task.run(tasks);
			done();
		}.bind(this));
	});

};
