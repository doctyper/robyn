/*jshint node:true*/
module.exports = function (grunt) {
	"use strict";

	var helpers = this;
	var spacer = "    ";

	this.write = function (string) {
		if (!grunt.option("verbose")) {
			grunt.log.write("    " + string);
		}
	};

	this.writeln = function (string) {
		if (!grunt.option("verbose")) {
			grunt.log.writeln("    " + string);
		}
	};

	return this;

};
