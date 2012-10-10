/*jshint node:true*/
module.exports = function (grunt) {
	"use strict";

	var helpers = this;

	this.installModules = function (args, cb) {
		helpers.spawn({
			cmd: "npm",
			args: ["install"].concat(args),
			title: "Installing npm modules",
			complete: cb
		});
	};

	return this;

};
