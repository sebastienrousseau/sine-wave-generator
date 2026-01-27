module.exports = {
	collectCoverage: true,
	collectCoverageFrom: ["src/sine-wave-generator.js"],
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	testEnvironment: "jsdom",
};
