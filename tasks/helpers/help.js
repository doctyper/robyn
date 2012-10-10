/*jshint node:true*/
module.exports = function (grunt) {
	"use strict";

	// TODO: ditch this when grunt v0.4 is released
	grunt.util = grunt.util || grunt.utils;

	var path = require("path");
	var files = grunt.file.expandFiles(path.join(__dirname, "*")).filter(function (helper) {
		return helper.indexOf("help.js") === -1;
	});

	var helpers = {},
		helper;

	files.forEach(function (file, i) {
		helper = require(file).call(helpers, grunt);
	});

	return helpers;
};
