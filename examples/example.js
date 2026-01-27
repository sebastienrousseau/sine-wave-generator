"use strict";

(() => {
	const Ease = {
		sineInOut: (time, amplitude) =>
			(amplitude * (Math.sin(time * Math.PI) + 1)) / 2,
		easedSine: (percent, amplitude) => {
			const goldenSection = (1 - 1 / 1.618033988749895) / 2;
			if (percent < goldenSection || percent > 1 - goldenSection) {
				return 0;
			}
			const adjustedPercent =
				(percent - goldenSection) / (1 - 2 * goldenSection);
			return Math.sin(adjustedPercent * Math.PI) * amplitude;
		},
	};

	const clamp01 = (value) => Math.min(1, Math.max(0, value));

	const createGenerator = (canvas, options = {}) => {
		const generator = new SineWaveGenerator({ el: canvas, ...options });
		generator.start();
		return generator;
	};

	const addWaves = (generator, waves) => {
		waves.forEach((wave) => generator.addWave(wave));
	};

	const withCanvas = (id, callback) => {
		const canvas = document.getElementById(id);
		if (!canvas) {
			return;
		}
		callback(canvas);
	};

	const createPointerController = (canvas, generator) => {
		const pointerState = { x: 0.5, y: 0.5, rafId: null };

		const applyPointer = () => {
			pointerState.rafId = null;
			const amplitudeTarget =
				40 + 120 * (1 - Math.abs(pointerState.y - 0.5) * 2);
			const wavelengthTarget =
				120 + 240 * (1 - Math.abs(pointerState.x - 0.5) * 2);
			generator.waves.forEach((wave) => {
				wave.amplitude = amplitudeTarget;
				wave.wavelength = wavelengthTarget;
				wave.phase = pointerState.y * Math.PI * 2;
			});
		};

		canvas.addEventListener("pointermove", (event) => {
			const rect = canvas.getBoundingClientRect();
			pointerState.x = clamp01((event.clientX - rect.left) / rect.width);
			pointerState.y = clamp01((event.clientY - rect.top) / rect.height);
			if (!pointerState.rafId) {
				pointerState.rafId = requestAnimationFrame(applyPointer);
			}
		});
	};

	document.addEventListener("DOMContentLoaded", () => {
		if (typeof window.SineWaveGenerator !== "function") {
			return;
		}

		withCanvas("sineCanvasBasic", (canvas) => {
			const generator = createGenerator(canvas);
			generator.addWave({
				amplitude: 26,
				wavelength: 140,
				speed: 0.8,
				segmentLength: 8,
			});
		});

		withCanvas("sineCanvasMulti", (canvas) => {
			const generator = createGenerator(canvas);
			addWaves(generator, [
				{
					amplitude: 18,
					wavelength: 140,
					speed: 0.6,
					segmentLength: 10,
					strokeStyle: null,
				},
				{
					amplitude: 28,
					wavelength: 200,
					speed: 0.45,
					segmentLength: 12,
					strokeStyle: "rgba(14,165,233,0.5)",
				},
				{
					amplitude: 12,
					wavelength: 90,
					speed: 0.9,
					segmentLength: 8,
					strokeStyle: "rgba(15,23,42,0.35)",
				},
			]);
		});

		withCanvas("sineCanvasPointer", (canvas) => {
			const generator = createGenerator(canvas);
			generator.addWave({
				amplitude: 32,
				wavelength: 180,
				speed: 0.7,
				segmentLength: 8,
			});
			createPointerController(canvas, generator);
		});

		withCanvas("sineCanvasDynamic", (canvas) => {
			const generator = createGenerator(canvas);
			const waveStack = [
				{ amplitude: 12, wavelength: 100, speed: 0.5, segmentLength: 10 },
				{ amplitude: 20, wavelength: 140, speed: 0.6, segmentLength: 10 },
				{ amplitude: 28, wavelength: 180, speed: 0.7, segmentLength: 10 },
				{ amplitude: 36, wavelength: 220, speed: 0.8, segmentLength: 12 },
				{ amplitude: 18, wavelength: 120, speed: 0.55, segmentLength: 8 },
			];
			let currentIndex = 0;
			let removing = false;

			const addWave = () => {
				if (generator.waves.length < waveStack.length) {
					generator.addWave(waveStack[currentIndex]);
					currentIndex = (currentIndex + 1) % waveStack.length;
					setTimeout(addWave, 400);
				} else if (!removing) {
					removing = true;
					setTimeout(removeWave, 600);
				}
			};

			const removeWave = () => {
				if (generator.waves.length > 1) {
					generator.removeWave(0);
					setTimeout(removeWave, 400);
				} else {
					removing = false;
					setTimeout(addWave, 600);
				}
			};

			addWave();
		});

		withCanvas("sineCanvasPerformance", (canvas) => {
			const generator = createGenerator(canvas, { maxPixelRatio: 1 });
			addWaves(generator, [
				{ amplitude: 18, wavelength: 160, speed: 0.4, segmentLength: 14 },
				{ amplitude: 10, wavelength: 120, speed: 0.55, segmentLength: 16 },
				{ amplitude: 6, wavelength: 90, speed: 0.7, segmentLength: 18 },
			]);
		});

		withCanvas("sineCanvasEasing", (canvas) => {
			const generator = createGenerator(canvas);
			generator.addWave({
				amplitude: 30,
				wavelength: 160,
				speed: 0.6,
				segmentLength: 10,
				easing: Ease.easedSine,
			});
		});

		withCanvas("sineCanvasPause", (canvas) => {
			const generator = createGenerator(canvas);
			generator.addWave({
				amplitude: 24,
				wavelength: 150,
				speed: 0.7,
				segmentLength: 10,
			});

			const pauseButton = document.querySelector('[data-action="pause"]');
			const resumeButton = document.querySelector('[data-action="resume"]');

			if (pauseButton) {
				pauseButton.addEventListener("click", () => generator.stop());
			}
			if (resumeButton) {
				resumeButton.addEventListener("click", () => generator.start());
			}
		});
	});
})();
