/**
 * Example usage of the sine-wave-generator.js library
 * https://github.com/sebastienrousseau/sine-wave-generator
 */

"use strict";

document.addEventListener("DOMContentLoaded", function () {
	/**
	 * Ease functions for smooth animations.
	 * @namespace Ease
	 */
	const Ease = {
		/**
		 * Provides smooth easing in and out animation.
		 * @param {number} time - The time parameter.
		 * @param {number} amplitude - The amplitude of the wave.
		 * @returns {number} - The eased value.
		 */
		sineInOut: (time, amplitude) =>
			(amplitude * (Math.sin(time * Math.PI) + 1)) / 2,
		/**
		 * Provides eased sine animation.
		 * @param {number} percent - The percentage of the animation.
		 * @param {number} amplitude - The amplitude of the wave.
		 * @returns {number} - The eased value.
		 */
		easedSine: (percent, amplitude) => {
			let value;
			const goldenSection = (1 - 1 / 1.618033988749895) / 2;
			if (percent < goldenSection) {
				value = 0;
			} else if (percent > 1 - goldenSection) {
				value = 0;
			} else {
				const adjustedPercent =
					(percent - goldenSection) / (1 - 2 * goldenSection);
				value = Math.sin(adjustedPercent * Math.PI) * amplitude;
			}
			return value;
		},
	};

	// Constants
	const FIBONACCI = 1.618033988749895;
	const DEFAULT_AMPLITUDE = 10;
	const DEFAULT_WAVELENGTH = 100;
	const DEFAULT_STROKE_STYLE = "rgba(255,255,255,0.2)";
	const DEFAULT_SEGMENT_LENGTH = 10;
	const LINE_WIDTH = 2;
	const SPEED = FIBONACCI;

	// Example 1: Basic Single Wave
	const canvas1 = document.getElementById("sineCanvas1");
	const sineWavesGenerator = new SineWaveGenerator({ el: canvas1 });
	sineWavesGenerator.start(); // Start the animation

	// To add a wave dynamically:
	sineWavesGenerator.addWave({
		amplitude: 10,
		wavelength: 50,
		strokeStyle: DEFAULT_STROKE_STYLE,
		speed: 2,
		easing: Ease.sineInOut,
	});

	// Example 2: Multiple Waves with Different Configurations
	const canvas2 = document.getElementById("sineCanvas2");
	const sineWavesGenerator2 = new SineWaveGenerator({ el: canvas2 });
	sineWavesGenerator2.start(); // Start the animation

	// To add a wave dynamically:
	sineWavesGenerator2.addWave({
		amplitude: 20,
		wavelength: 100,
		strokeStyle: DEFAULT_STROKE_STYLE,
		speed: 2,
		easing: Ease.sineInOut,
	});
	sineWavesGenerator2.addWave({
		amplitude: 10,
		wavelength: 50,
		strokeStyle: DEFAULT_STROKE_STYLE,
		speed: 2,
		easing: Ease.sineInOut,
	});

	// Example 3: Interactive Wave with Mouse Movement
	const canvas3 = document.getElementById("sineCanvas3");
	const sineWavesGenerator3 = new SineWaveGenerator({ el: canvas3 });
	sineWavesGenerator3.start(); // Start the animation

	// To add a wave dynamically:
	sineWavesGenerator3.addWave({
		amplitude: 10,
		wavelength: 50,
		strokeStyle: DEFAULT_STROKE_STYLE,
		speed: 2,
		easing: Ease.sineInOut,
	});
	// Easing function for smoother transitions
	function smoothStep(start, end, t) {
		return start + (end - start) * t * t * (3 - 2 * t);
	}

	canvas3.addEventListener("mousemove", (event) => {
		const mouseX = event.clientX / canvas3.width;
		const mouseY = event.clientY / canvas3.height;

		const maxAmplitude = 500; // Maximum amplitude adjustment
		const maxWavelength = 500; // Maximum wavelength adjustment

		const center = { x: 0.5, y: 0.5 }; // Center of the canvas

		const distanceX = Math.abs(center.x - mouseX); // Distance from mouse to canvas center horizontally
		const distanceY = Math.abs(center.y - mouseY); // Distance from mouse to canvas center vertically

		const targetAmplitude = maxAmplitude * (1 - distanceY); // Adjust amplitude based on vertical mouse movement
		const targetWavelength = maxWavelength * (1 - distanceX); // Adjust wavelength based on horizontal mouse movement

		sineWavesGenerator3.waves.forEach((wave) => {
			// Interpolate wave amplitude smoothly
			wave.amplitude = smoothStep(wave.amplitude, targetAmplitude, 1); // Adjust the value '0.1' for the desired smoothness
			// Interpolate wave wavelength smoothly
			wave.wavelength = smoothStep(wave.wavelength, targetWavelength, 1); // Adjust the value '0.1' for the desired smoothness

			// Change phase based on mouse Y position
			wave.phase = mouseY * Math.PI * 2;
		});
	});

	// Example 4: Dynamic Wave Management
	const canvas4 = document.getElementById("sineCanvas4");
	const sineWavesGenerator4 = new SineWaveGenerator({ el: canvas4 });
	sineWavesGenerator4.start(); // Start the animation

	// Adding waves dynamically
	const wavesConfig = [
		{
			amplitude: 10,
			wavelength: DEFAULT_SEGMENT_LENGTH,
			strokeStyle: DEFAULT_STROKE_STYLE,
			speed: SPEED,
			easing: Ease.sineInOut,
		},
		{
			amplitude: 20,
			wavelength: DEFAULT_SEGMENT_LENGTH,
			strokeStyle: DEFAULT_STROKE_STYLE,
			speed: SPEED,
			easing: Ease.sineInOut,
		},
		{
			amplitude: 30,
			wavelength: DEFAULT_SEGMENT_LENGTH,
			strokeStyle: DEFAULT_STROKE_STYLE,
			speed: SPEED,
			easing: Ease.sineInOut,
		},
		{
			amplitude: 40,
			wavelength: DEFAULT_SEGMENT_LENGTH,
			strokeStyle: DEFAULT_STROKE_STYLE,
			speed: SPEED,
			easing: Ease.sineInOut,
		},
		{
			amplitude: 50,
			wavelength: DEFAULT_SEGMENT_LENGTH,
			strokeStyle: DEFAULT_STROKE_STYLE,
			speed: SPEED,
			easing: Ease.sineInOut,
		},
		{
			amplitude: 60,
			wavelength: DEFAULT_SEGMENT_LENGTH,
			strokeStyle: DEFAULT_STROKE_STYLE,
			speed: SPEED,
			easing: Ease.sineInOut,
		},
	];

	function manageWaves() {
		const removeInterval = 500; // 0.5 seconds
		const addInterval = 500; // 0.5 seconds

		let currentIndex = 0;
		let removing = false;

		const removeWave = () => {
			if (sineWavesGenerator4.waves.length > 1) {
				sineWavesGenerator4.removeWave(0);
				setTimeout(removeWave, removeInterval);
			} else {
				removing = false; // Reset the removing flag
				setTimeout(addWave, addInterval);
			}
		};

		const addWave = () => {
			if (sineWavesGenerator4.waves.length < 6) {
				sineWavesGenerator4.addWave(wavesConfig[currentIndex]);
				currentIndex = (currentIndex + 1) % wavesConfig.length;
				setTimeout(addWave, addInterval);
			} else {
				if (!removing) {
					removing = true; // Set the removing flag
					setTimeout(removeWave, removeInterval);
				}
			}
		};

		if (!removing) {
			addWave();
		}
	}

	// Start the process
	manageWaves();
});
