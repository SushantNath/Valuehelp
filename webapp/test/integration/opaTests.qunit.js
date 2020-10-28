/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/sap/valuehelpFilter/valuehelpFilter/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});