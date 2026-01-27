"use strict";

(() => {
	const TWO_PI = Math.PI * 2;

	const clamp01 = (value) => Math.min(1, Math.max(0, value));

	const bpmToSpeed = (bpm, beatsPerCycle) =>
		bpm / (3600 * Math.max(1, beatsPerCycle));

	const hueFromValue = (value, base = 210) =>
		(base + value * 140 + 360) % 360;

	const getSize = (generator, canvas) => ({
		width: generator.displayWidth || canvas.clientWidth || canvas.width || 1,
		height: generator.displayHeight || canvas.clientHeight || canvas.height || 1,
	});

	const setupControls = (card) => {
		const controls = {
			bpm: 96,
			amplitude: 16,
			frequency: 8,
			phase: 0,
		};
		const inputs = Array.from(card.querySelectorAll("[data-control]"));
		inputs.forEach((input) => {
			const key = input.dataset.control;
			controls[key] = Number(input.value);
			const valueEl = input
				.closest(".control-row")
				.querySelector("[data-value]");
			if (valueEl) {
				valueEl.textContent = input.value;
			}
			input.addEventListener("input", () => {
				controls[key] = Number(input.value);
				if (valueEl) {
					valueEl.textContent = input.value;
				}
			});
		});
		return controls;
	};

	const createGenerator = (canvas) => {
		const generator = new SineWaveGenerator({ el: canvas });
		generator.addWave({ amplitude: 1, wavelength: 1, speed: 0.05 });
		return generator;
	};

	const startExample = (id, beatsPerCycle, draw) => {
		const card = document.querySelector(`[data-example="${id}"]`);
		if (!card) {
			return;
		}
		const canvas = card.querySelector("canvas");
		if (!canvas) {
			return;
		}
		const controls = setupControls(card);
		const generator = createGenerator(canvas);
		const ctx = generator.ctx;
		generator.drawWave = (wave, deltaScale = 1) => {
			const speed = bpmToSpeed(controls.bpm, beatsPerCycle);
			const time = wave.phase + (controls.phase * Math.PI) / 180;
			draw({ ctx, canvas, generator, controls, time });
			wave.phase += speed * TWO_PI * deltaScale;
		};
		generator.start();
	};

	const drawPulseMatrix = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const columns = 16;
		const rows = 10;
		const spacingX = width / columns;
		const spacingY = height / rows;
		const freq = controls.frequency * 0.3;
		const amplitude = controls.amplitude;
		for (let y = 0; y <= rows; y += 1) {
			for (let x = 0; x <= columns; x += 1) {
				const nx = x * freq + time;
				const ny = y * freq + time;
				const value = Math.sin(nx) * Math.cos(ny);
				const radius = 4 + amplitude * clamp01((value + 1) / 2);
				const hue = hueFromValue(value, 190);
				ctx.fillStyle = `hsl(${hue}deg 70% 60%)`;
				ctx.beginPath();
				ctx.arc(
					x * spacingX + spacingX * 0.2,
					y * spacingY + spacingY * 0.2,
					radius * 0.25,
					0,
					TWO_PI,
				);
				ctx.fill();
			}
		}
	};

	const drawDNAHelix = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const amplitude = controls.amplitude;
		const freq = controls.frequency * 0.04;
		const centerX = width * 0.5;
		ctx.lineWidth = 2;
		for (let y = 0; y <= height; y += 6) {
			const phase = y * freq + time;
			const xOffset = Math.sin(phase) * amplitude;
			const xOffset2 = Math.sin(phase + Math.PI) * amplitude;
			const depth = (Math.cos(phase) + 1) * 0.5;
			const hue = hueFromValue(depth, 210);
			ctx.strokeStyle = `hsla(${hue}deg 80% 60% / ${0.35 + depth * 0.5})`;
			ctx.beginPath();
			ctx.moveTo(centerX + xOffset, y);
			ctx.lineTo(centerX + xOffset2, y);
			ctx.stroke();
			ctx.fillStyle = `hsla(${hue}deg 80% 55% / ${0.4 + depth * 0.6})`;
			ctx.beginPath();
			ctx.arc(centerX + xOffset, y, 3 + depth * 2, 0, TWO_PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(centerX + xOffset2, y, 3 + (1 - depth) * 2, 0, TWO_PI);
			ctx.fill();
		}
	};

	const drawLissajousOrbit = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerX = width * 0.5;
		const centerY = height * 0.5;
		const amplitude = controls.amplitude;
		const freq = controls.frequency;
		const phaseShift = (controls.phase * Math.PI) / 180;
		ctx.lineWidth = 2;
		ctx.beginPath();
		for (let i = 0; i <= 240; i += 1) {
			const t = (i / 240) * TWO_PI;
			const x =
				centerX + Math.sin(t * freq + time) * amplitude * 0.9;
			const y =
				centerY + Math.sin(t * (freq + 1) + phaseShift + time) * amplitude;
			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		const hue = hueFromValue(Math.sin(time), 240);
		ctx.strokeStyle = `hsla(${hue}deg 75% 55% / 0.8)`;
		ctx.stroke();
		const orbX =
			centerX + Math.sin(time * freq) * amplitude * 0.9;
		const orbY =
			centerY + Math.sin(time * (freq + 1) + phaseShift) * amplitude;
		ctx.fillStyle = `hsl(${hue}deg 80% 60%)`;
		ctx.beginPath();
		ctx.arc(orbX, orbY, 6, 0, TWO_PI);
		ctx.fill();
	};

	const drawWaveformTerrain = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const layers = 8;
		const freq = controls.frequency * 0.03;
		const amplitude = controls.amplitude;
		for (let layer = 0; layer < layers; layer += 1) {
			const depth = layer / (layers - 1);
			const yBase = height * (0.2 + depth * 0.7);
			const phase = time + depth * controls.phase * 0.03;
			ctx.beginPath();
			for (let x = 0; x <= width; x += 6) {
				const amp = amplitude * (1 - depth) + 6;
				const value = Math.sin(x * freq + phase) * amp;
				const y = yBase + value;
				if (x === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			const hue = hueFromValue(depth, 200);
			ctx.strokeStyle = `hsla(${hue}deg 70% 55% / ${0.2 + depth * 0.6})`;
			ctx.lineWidth = 1.6;
			ctx.stroke();
		}
	};

	const drawRadialBloom = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerX = width * 0.5;
		const centerY = height * 0.5;
		const radiusMax = Math.min(width, height) * 0.45;
		const freq = controls.frequency * 0.15;
		const amplitude = controls.amplitude;
		const beatProgress = (time / TWO_PI) % 1;
		const downbeat = Math.pow(Math.max(0, Math.cos(beatProgress * TWO_PI)), 6);
		for (let r = 18; r < radiusMax; r += 12) {
			const value = Math.sin(r * freq + time);
			const pulse = amplitude * (0.4 + downbeat);
			const offset = value * pulse;
			const hue = hueFromValue(value, 280);
			ctx.strokeStyle = `hsla(${hue}deg 75% 60% / 0.6)`;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(centerX, centerY, r + offset, 0, TWO_PI);
			ctx.stroke();
		}
	};

	document.addEventListener("DOMContentLoaded", () => {
		if (typeof window.SineWaveGenerator !== "function") {
			return;
		}
		startExample("pulseMatrix", 4, drawPulseMatrix);
		startExample("dnaHelix", 4, drawDNAHelix);
		startExample("lissajousOrbit", 3, drawLissajousOrbit);
		startExample("waveformTerrain", 6, drawWaveformTerrain);
		startExample("radialBloom", 4, drawRadialBloom);
	});
})();
