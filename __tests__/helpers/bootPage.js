"use strict";

const { buildPageFixture, buildBareFixture } = require("./domFixture");
const { createMockCanvasContext } = require("./browserMocks");

const PAGE_HTML = {
	template: buildPageFixture("template.html"),
	gettingStarted: buildPageFixture("getting-started.html"),
	examples: buildPageFixture("examples.html"),
	playground: buildPageFixture("playground.html"),
	guides: buildPageFixture("guides.html"),
	reactQuickstart: buildPageFixture("react-quickstart.html"),
	bare: buildBareFixture(),
};

const mockCanvasApis = () => {
	HTMLCanvasElement.prototype.getContext = () => createMockCanvasContext();
	HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
		width: 300,
		height: 220,
		top: 0,
		left: 0,
		right: 300,
		bottom: 220,
	});
};

/** Loads one real page's DOM, requires the library + example.js fresh, and boots it. */
const bootExamplePage = ({ page = "examples", onBeforeBoot } = {}) => {
	document.body.innerHTML = PAGE_HTML[page];
	mockCanvasApis();

	jest.isolateModules(() => {
		require("../../src/sine-wave-generator.js");
		require("../../src/audio-sync.js");
		require("../../examples/example.js");
	});

	if (onBeforeBoot) {
		onBeforeBoot();
	}

	document.dispatchEvent(new window.Event("DOMContentLoaded"));
};

module.exports = { PAGE_HTML, mockCanvasApis, bootExamplePage };
