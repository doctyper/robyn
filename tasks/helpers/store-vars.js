/*jshint node:true*/
module.exports = function (grunt) {
	"use strict";

	var helpers = this;

	this.storeVars = function (name, title, cb) {
		var pkg = require("../utils/pkg");

		pkg.config.vars["PROJECT_NAME"] = name;
		pkg.config.vars["PROJECT_TITLE"] = title;

		// Replace variables
		helpers.replaceInFiles(function () {
			pkg.save();

			if (cb) {
				cb();
			}
		});
	};

	return this;

};
