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

	const drawMoireInterference = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const spacing = 10 + controls.frequency * 2;
		const angle = Math.sin(time) * 0.25 + (controls.phase * Math.PI) / 360;
		const centerX = width * 0.5;
		const centerY = height * 0.5;
		const maxExtent = Math.max(width, height) * 0.75;
		const drawGrid = (rotation, hueOffset) => {
			ctx.save();
			ctx.translate(centerX, centerY);
			ctx.rotate(rotation);
			ctx.translate(-centerX, -centerY);
			for (let x = -maxExtent; x <= width + maxExtent; x += spacing) {
				const value = Math.sin((x / spacing) * 0.35 + time);
				const hue = hueFromValue(value, hueOffset);
				ctx.strokeStyle = `hsla(${hue}deg 70% 60% / 0.35)`;
				ctx.beginPath();
				ctx.moveTo(x, -maxExtent);
				ctx.lineTo(x, height + maxExtent);
				ctx.stroke();
			}
			ctx.restore();
		};
		drawGrid(angle, 180);
		drawGrid(-angle * 1.3, 240);
	};

	const drawKineticTypography = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const text = "SINE WAVE";
		const amplitude = controls.amplitude;
		const freq = controls.frequency * 0.6;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = "600 28px 'SF Pro Text', 'Helvetica Neue', sans-serif";
		const letters = text.split("");
		const totalWidth = letters.length * 18;
		letters.forEach((char, index) => {
			const offset = index - letters.length / 2;
			const wave = Math.sin(time + offset * freq) * amplitude;
			const hue = hueFromValue(wave / amplitude, 210);
			ctx.fillStyle = `hsl(${hue}deg 80% 55%)`;
			ctx.fillText(
				char,
				width * 0.5 + offset * 18,
				height * 0.5 + wave,
			);
		});
		ctx.strokeStyle = "rgba(15, 23, 42, 0.1)";
		ctx.strokeRect(
			width * 0.5 - totalWidth * 0.5 - 16,
			height * 0.5 - 30,
			totalWidth + 32,
			60,
		);
	};

	const drawDampedSine = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerY = height * 0.5;
		const amplitude = controls.amplitude;
		const freq = controls.frequency * 0.03;
		const progress = (time / TWO_PI) % 1;
		const envelope = Math.exp(-3.2 * progress);
		ctx.beginPath();
		for (let x = 0; x <= width; x += 4) {
			const value = Math.sin(x * freq + time);
			const y = centerY + value * amplitude * envelope;
			if (x === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		const hue = hueFromValue(envelope, 140);
		ctx.strokeStyle = `hsla(${hue}deg 70% 55% / 0.8)`;
		ctx.lineWidth = 2;
		ctx.stroke();
	};

	const drawRecursiveSine = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerY = height * 0.5;
		const amplitude = controls.amplitude;
		const baseFreq = controls.frequency * 0.02;
		const mod = Math.sin(time * 0.8) * 0.02 * controls.frequency;
		ctx.beginPath();
		for (let x = 0; x <= width; x += 4) {
			const nested = Math.sin(time + x * baseFreq * 0.4) * 0.6 + 1;
			const value = Math.sin(x * (baseFreq + mod * nested) + time);
			const y = centerY + value * amplitude * (0.6 + nested * 0.4);
			if (x === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		const hue = hueFromValue(Math.sin(time), 260);
		ctx.strokeStyle = `hsla(${hue}deg 70% 55% / 0.85)`;
		ctx.lineWidth = 2;
		ctx.stroke();
	};

	const boot = () => {
		if (typeof window.SineWaveGenerator !== "function") {
			setTimeout(boot, 50);
			return;
		}
		startExample("pulseMatrix", 4, drawPulseMatrix);
		startExample("dnaHelix", 4, drawDNAHelix);
		startExample("lissajousOrbit", 3, drawLissajousOrbit);
		startExample("waveformTerrain", 6, drawWaveformTerrain);
		startExample("radialBloom", 4, drawRadialBloom);
		startExample("moireInterference", 4, drawMoireInterference);
		startExample("kineticTypography", 4, drawKineticTypography);
		startExample("dampedSine", 4, drawDampedSine);
		startExample("recursiveSine", 4, drawRecursiveSine);
	};

	document.addEventListener("DOMContentLoaded", () => {
		boot();
	});
})();
