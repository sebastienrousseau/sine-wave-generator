/**
 * react-quickstart.js v0.0.3
 *
 * Live demo bundle for the React quickstart page. Mounts a component
 * built entirely on useSineWaveGenerator via React.createElement — no
 * JSX, so no extra babel preset is needed beyond what this repo already
 * ships. Only built and served for /react-quickstart/, not bundled into
 * any other page.
 *
 * Website:
 *
 * https://sine-wave-generator.com
 *
 * Source:
 *
 * https://github.com/sebastienrousseau/sine-wave-generator
 *
 */

"use strict";

const React = require("react");
const { createRoot } = require("react-dom/client");
const { useSineWaveGenerator } = require("../src/use-sine-wave-generator.js");

const SineWaveDemo = () => {
	const { canvasRef } = useSineWaveGenerator({
		waves: [
			{ amplitude: 22, wavelength: 140, speed: 0.05 },
			{
				amplitude: 14,
				wavelength: 100,
				speed: 0.06,
				strokeStyle: "rgba(168, 85, 247, 0.5)",
			},
		],
	});
	return React.createElement("canvas", {
		ref: canvasRef,
		"aria-label": "React sine wave demo",
		style: {
			width: "100%",
			height: "220px",
			display: "block",
			borderRadius: "16px",
		},
	});
};

const mount = document.getElementById("react-quickstart-root");
if (mount) {
	createRoot(mount).render(React.createElement(SineWaveDemo));
}
