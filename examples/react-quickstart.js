/**
 * react-quickstart.js v0.0.3
 *
 * Live demo bundle for the React quickstart page: three components built
 * entirely on useSineWaveGenerator via React.createElement — no JSX, so
 * no extra babel preset is needed beyond what this repo already ships.
 * Only built and served for /react-quickstart/, not bundled into any
 * other page.
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
const { AudioSync } = require("../src/audio-sync.js");

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

const HeroBackgroundDemo = () => {
	const { canvasRef } = useSineWaveGenerator({
		autoResize: true,
		waves: [
			{
				amplitude: 16,
				wavelength: 220,
				speed: 0.06,
				strokeStyle: "rgba(94, 234, 212, 0.35)",
			},
			{
				amplitude: 10,
				wavelength: 160,
				speed: 0.04,
				strokeStyle: "rgba(168, 85, 247, 0.25)",
			},
		],
	});
	return React.createElement("canvas", {
		ref: canvasRef,
		"aria-label": "Hero background React demo",
		style: {
			width: "100%",
			height: "160px",
			display: "block",
			borderRadius: "16px",
		},
	});
};

const AudioReactiveDemo = () => {
	const { canvasRef, generatorRef } = useSineWaveGenerator({
		waves: [
			{
				amplitude: 10,
				wavelength: 140,
				speed: 0.03,
				strokeStyle: "rgba(99, 102, 241, 0.6)",
			},
		],
	});
	const audioSyncRef = React.useRef(null);
	const streamRef = React.useRef(null);
	const [listening, setListening] = React.useState(false);
	const [status, setStatus] = React.useState("Idle");

	const stopListening = () => {
		if (generatorRef.current) {
			generatorRef.current.unsyncAudio();
		}
		if (audioSyncRef.current) {
			audioSyncRef.current.disconnect();
			audioSyncRef.current = null;
		}
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
		setListening(false);
		setStatus("Idle");
	};

	const startListening = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			streamRef.current = stream;
			const audioSync = new AudioSync();
			audioSync.connect(stream);
			audioSyncRef.current = audioSync;
			generatorRef.current.syncToAudio(audioSync, {
				amplitude: { source: "energy", intensity: 2 },
			});
			setListening(true);
			setStatus("Listening — try saying something");
		} catch {
			setStatus("Microphone access blocked");
		}
	};

	React.useEffect(() => stopListening, []);

	return React.createElement(
		"div",
		null,
		React.createElement("canvas", {
			key: "canvas",
			ref: canvasRef,
			"aria-label": "Audio-reactive React demo",
			style: {
				width: "100%",
				height: "160px",
				display: "block",
				borderRadius: "16px",
			},
		}),
		React.createElement(
			"div",
			{
				key: "controls",
				style: {
					marginTop: "10px",
					display: "flex",
					gap: "10px",
					alignItems: "center",
				},
			},
			React.createElement(
				"button",
				{
					key: "btn",
					type: "button",
					className: "btn",
					onClick: () => (listening ? stopListening() : startListening()),
				},
				listening ? "Stop" : "Start listening",
			),
			React.createElement("span", { key: "status" }, status),
		),
	);
};

const mountComponent = (id, Component) => {
	const mount = document.getElementById(id);
	if (mount) {
		createRoot(mount).render(React.createElement(Component));
	}
};

/** Exported so tests can re-run mounting against a fresh DOM without
 * needing to bust any module cache — the module itself, and the React
 * instance it renders with, stay the same throughout a test file. */
const mountAll = () => {
	mountComponent("react-quickstart-root", SineWaveDemo);
	mountComponent("react-hero-root", HeroBackgroundDemo);
	mountComponent("react-audio-root", AudioReactiveDemo);
};

mountAll();

module.exports = { mountAll };
