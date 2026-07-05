module.exports = {
	collectCoverage: true,
	collectCoverageFrom: [
		"src/sine-wave-generator.js",
		"src/audio-sync.js",
		"src/use-sine-wave-generator.js",
		"examples/example.js",
		"examples/react-quickstart.js",
	],
	coverageThreshold: {
		// Per-file thresholds (not "global", which would average example.js's
		// gap into the core library's otherwise-100% coverage and mask it).
		"./src/sine-wave-generator.js": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		"./src/audio-sync.js": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		"./src/use-sine-wave-generator.js": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		// branches is 75 rather than 100: stopListening()'s three null-guards
		// are fully covered on the "stop after successfully starting" path;
		// the "unmount before ever starting" path (audioSyncRef/streamRef
		// still null) would need the private AudioReactiveDemo component
		// exported just to unmount-test it directly — not worth doing for
		// two defensive guards with no user-visible behavior difference.
		"./examples/react-quickstart.js": {
			branches: 75,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		// example.js drives ~50 decorative demos across every page template.
		// The remaining gap is genuinely unreachable defensive code (guards
		// whose "missing element" branch can't occur with the real markup,
		// e.g. URL.pathname is never an empty string) or deep per-frame
		// internals of one hand-tuned decorative demo (rainbowFundamentals)
		// where contriving a test would cost far more than it verifies.
		// See __tests__/example.*.test.js for what IS covered.
		"./examples/example.js": {
			branches: 78,
			functions: 94,
			lines: 96,
			statements: 96,
		},
	},
	testEnvironment: "jsdom",
	testPathIgnorePatterns: ["/node_modules/", "/__tests__/helpers/"],
};
