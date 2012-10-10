/*jshint node:true*/
module.exports = function (grunt) {
	"use strict";

	var helpers = this;

	this.getAssertion = function (value) {
		return (value === "Y/n" || value.toLowerCase() === "y") ? true : false;
	};

	return this;

};
