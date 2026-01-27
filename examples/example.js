"use strict";

(() => {
	const TWO_PI = Math.PI * 2;

	const clamp01 = (value) => Math.min(1, Math.max(0, value));

	const bpmToSpeed = (bpm, beatsPerCycle) =>
		bpm / (3600 * Math.max(1, beatsPerCycle));

	const hueFromValue = (value, base = 210) =>
		(base + value * 140 + 360) % 360;

	const getBPMColor = (time, bpm = 128, baseHue = 210) => {
		const beatPhase = time * (bpm / 128);
		const pulse = (Math.sin(beatPhase) + 1) * 0.5;
		return `hsl(${(baseHue + pulse * 120) % 360}deg 75% 55%)`;
	};

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

	const createGenerator = (canvas, options = {}) => {
		const generator = new SineWaveGenerator({ el: canvas, ...options });
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
		generator.addWave({ amplitude: 1, wavelength: 1, speed: 0.05 });
		const ctx = generator.ctx;
		generator.drawWave = (wave, deltaScale = 1) => {
			const speed = bpmToSpeed(controls.bpm, beatsPerCycle);
			const time = wave.phase + (controls.phase * Math.PI) / 180;
			draw({ ctx, canvas, generator, controls, time });
			wave.phase += speed * TWO_PI * deltaScale;
		};
		generator.start();
	};

	const easedSine = (percent, amplitude) => {
		const goldenSection = (1 - 1 / 1.618033988749895) / 2;
		if (percent < goldenSection || percent > 1 - goldenSection) {
			return 0;
		}
		const adjustedPercent = (percent - goldenSection) / (1 - 2 * goldenSection);
		return Math.sin(adjustedPercent * Math.PI) * amplitude;
	};

	const startFundamentals = () => {
		const basic = document.getElementById("sineCanvasBasic");
		if (basic) {
			const generator = createGenerator(basic);
			generator.addWave({
				amplitude: 26,
				wavelength: 140,
				speed: 0.04,
				segmentLength: 10,
			});
			generator.start();
		}

		const multi = document.getElementById("sineCanvasMulti");
		if (multi) {
			const generator = createGenerator(multi);
			generator.addWave({ amplitude: 18, wavelength: 140, speed: 0.04, segmentLength: 10 });
			generator.addWave({
				amplitude: 28,
				wavelength: 200,
				speed: 0.035,
				segmentLength: 12,
				strokeStyle: "rgba(14,165,233,0.5)",
			});
			generator.addWave({
				amplitude: 12,
				wavelength: 90,
				speed: 0.05,
				segmentLength: 8,
				strokeStyle: "rgba(15,23,42,0.35)",
			});
			generator.start();
		}

		const pointer = document.getElementById("sineCanvasPointer");
		if (pointer) {
			const generator = createGenerator(pointer);
			generator.addWave({
				amplitude: 32,
				wavelength: 180,
				speed: 0.045,
				segmentLength: 8,
			});
			const pointerState = { x: 0.5, y: 0.5, rafId: null };
			const applyPointer = () => {
				pointerState.rafId = null;
				const amplitudeTarget = 40 + 120 * (1 - Math.abs(pointerState.y - 0.5) * 2);
				const wavelengthTarget = 120 + 240 * (1 - Math.abs(pointerState.x - 0.5) * 2);
				generator.waves.forEach((wave) => {
					wave.amplitude = amplitudeTarget;
					wave.wavelength = wavelengthTarget;
					wave.phase = pointerState.y * TWO_PI;
				});
			};
			pointer.addEventListener("pointermove", (event) => {
				const rect = pointer.getBoundingClientRect();
				pointerState.x = clamp01((event.clientX - rect.left) / rect.width);
				pointerState.y = clamp01((event.clientY - rect.top) / rect.height);
				if (!pointerState.rafId) {
					pointerState.rafId = requestAnimationFrame(applyPointer);
				}
			});
			generator.start();
		}

		const dynamic = document.getElementById("sineCanvasDynamic");
		if (dynamic) {
			const generator = createGenerator(dynamic);
			const waveStack = [
				{ amplitude: 12, wavelength: 100, speed: 0.035, segmentLength: 10 },
				{ amplitude: 20, wavelength: 140, speed: 0.04, segmentLength: 10 },
				{ amplitude: 28, wavelength: 180, speed: 0.045, segmentLength: 10 },
				{ amplitude: 36, wavelength: 220, speed: 0.05, segmentLength: 12 },
				{ amplitude: 18, wavelength: 120, speed: 0.038, segmentLength: 8 },
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
			generator.start();
		}

		const performance = document.getElementById("sineCanvasPerformance");
		if (performance) {
			const generator = createGenerator(performance, { maxPixelRatio: 1 });
			generator.addWave({ amplitude: 18, wavelength: 160, speed: 0.035, segmentLength: 14 });
			generator.addWave({ amplitude: 10, wavelength: 120, speed: 0.04, segmentLength: 16 });
			generator.addWave({ amplitude: 6, wavelength: 90, speed: 0.045, segmentLength: 18 });
			generator.start();
		}

		const easing = document.getElementById("sineCanvasEasing");
		if (easing) {
			const generator = createGenerator(easing);
			generator.addWave({
				amplitude: 30,
				wavelength: 160,
				speed: 0.04,
				segmentLength: 10,
				easing: easedSine,
			});
			generator.start();
		}

		const pause = document.getElementById("sineCanvasPause");
		if (pause) {
			const generator = createGenerator(pause);
			generator.addWave({
				amplitude: 24,
				wavelength: 150,
				speed: 0.04,
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
			generator.start();
		}
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

	const drawFluidColumn = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const amplitude = controls.amplitude;
		const freq = controls.frequency * 0.05;
		const columnCount = 6;
		for (let column = 0; column < columnCount; column += 1) {
			const columnX = (width / (columnCount + 1)) * (column + 1);
			ctx.beginPath();
			for (let y = 0; y <= height; y += 6) {
				const phase = y * freq + time + column * 0.6;
				const offset = Math.sin(phase) * amplitude;
				const x = columnX + offset;
				if (y === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			const thickness = 1.5 + (Math.sin(time + column) + 1) * 1.2;
			ctx.lineWidth = thickness;
			ctx.shadowBlur = 12;
			ctx.shadowColor = getBPMColor(time, 128, 200 + column * 10);
			ctx.strokeStyle = getBPMColor(time, 128, 200 + column * 10);
			ctx.stroke();
		}
		ctx.shadowBlur = 0;
	};

	const drawDiagonalRain = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const amplitude = controls.amplitude * 0.4;
		const freq = controls.frequency * 0.08;
		const count = 50;
		for (let i = 0; i < count; i += 1) {
			const baseX = (i / count) * width;
			const baseY = (i / count) * height;
			const drift = Math.sin(time + i * freq) * amplitude;
			const x1 = baseX + drift;
			const y1 = baseY + drift * 0.5;
			const x2 = x1 + 24;
			const y2 = y1 + 38;
			const thickness = 0.8 + Math.abs(drift) * 0.05;
			ctx.lineWidth = thickness;
			ctx.shadowBlur = 8;
			ctx.shadowColor = getBPMColor(time, 128, 240);
			ctx.strokeStyle = getBPMColor(time + i * 0.2, 128, 240);
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		}
		ctx.shadowBlur = 0;
	};

	const drawLissajousOrbit = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerX = width * 0.5;
		const centerY = height * 0.5;
		const amplitude = controls.amplitude;
		const freq = controls.frequency;
		const phaseShift = (controls.phase * Math.PI) / 180;
		ctx.lineWidth = 1.5 + Math.abs(Math.sin(time)) * 1.4;
		ctx.shadowBlur = 10;
		ctx.shadowColor = getBPMColor(time, 128, 240);
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
		ctx.shadowBlur = 0;
		const orbX = centerX + Math.sin(time * freq) * amplitude * 0.9;
		const orbY = centerY + Math.sin(time * (freq + 1) + phaseShift) * amplitude;
		ctx.fillStyle = `hsl(${hue}deg 80% 60%)`;
		ctx.beginPath();
		ctx.arc(orbX, orbY, 6, 0, TWO_PI);
		ctx.fill();
	};

	const drawLissajousExplorer = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerX = width * 0.5;
		const centerY = height * 0.5;
		const amplitudeX = controls.amplitude;
		const amplitudeY = controls.amplitude * 0.8;
		const a = Math.max(1, Math.round(controls.frequency));
		const b = Math.max(1, Math.round(controls.frequency + 2));
		const delta = (controls.phase * Math.PI) / 180;
		ctx.lineWidth = 1.5 + Math.abs(Math.sin(time)) * 1.8;
		ctx.shadowBlur = 10;
		ctx.shadowColor = getBPMColor(time, 128, 220);
		ctx.beginPath();
		for (let i = 0; i <= 320; i += 1) {
			const t = (i / 320) * TWO_PI;
			const x = centerX + amplitudeX * Math.sin(a * t + delta + time);
			const y = centerY + amplitudeY * Math.sin(b * t + time);
			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.strokeStyle = getBPMColor(time, 128, 220);
		ctx.stroke();
		ctx.shadowBlur = 0;
	};

	const drawFeedbackLoop = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerY = height * 0.5;
		const baseAmp = controls.amplitude;
		const carrierFreq = controls.frequency * 0.04;
		const modulator = (Math.sin(time * 0.8) + 1) * 0.5;
		ctx.beginPath();
		for (let x = 0; x <= width; x += 4) {
			const mod = Math.sin(x * 0.006 + time) * baseAmp * (0.2 + modulator);
			const carrier = Math.sin(x * carrierFreq + time * 1.6) * mod;
			const y = centerY + carrier;
			if (x === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		const hue = hueFromValue(modulator, 260);
		ctx.lineWidth = 1.5 + modulator * 2.2;
		ctx.shadowBlur = 10;
		ctx.shadowColor = getBPMColor(time, 128, 260);
		ctx.strokeStyle = `hsla(${hue}deg 70% 55% / 0.85)`;
		ctx.stroke();
		ctx.shadowBlur = 0;
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
			const nextRadius = Math.max(1, r + offset);
			const hue = hueFromValue(value, 280);
			ctx.strokeStyle = `hsla(${hue}deg 75% 60% / 0.6)`;
			ctx.lineWidth = 1 + Math.abs(value) * 1.8;
			ctx.shadowBlur = 10;
			ctx.shadowColor = getBPMColor(time, 128, 280);
			ctx.beginPath();
			ctx.arc(centerX, centerY, nextRadius, 0, TWO_PI);
			ctx.stroke();
		}
		ctx.shadowBlur = 0;
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
		ctx.lineWidth = 1.5 + Math.abs(Math.sin(time)) * 1.5;
		ctx.shadowBlur = 8;
		ctx.shadowColor = getBPMColor(time, 128, 260);
		ctx.stroke();
		ctx.shadowBlur = 0;
	};

	const startStringPhysics = () => {
		const card = document.querySelector('[data-example="stringPhysics"]');
		if (!card) {
			return;
		}
		const canvas = card.querySelector("canvas");
		if (!canvas) {
			return;
		}
		const generator = createGenerator(canvas);
		generator.addWave({ amplitude: 1, wavelength: 1, speed: 0.08 });
		const state = { amplitude: 0, decay: 0.95 };
		canvas.addEventListener("pointerdown", () => {
			state.amplitude = 100;
		});
		const ctx = generator.ctx;
		generator.drawWave = (wave, deltaScale = 1) => {
			state.amplitude *= state.decay;
			const { width, height } = getSize(generator, canvas);
			const centerY = height * 0.5;
			ctx.beginPath();
			for (let x = 0; x <= width; x += 6) {
				const offset = Math.sin(x * 0.02 + wave.phase) * state.amplitude * 0.02;
				const y = centerY + offset;
				if (x === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			ctx.lineWidth = 1 + Math.abs(state.amplitude) * 0.02;
			ctx.shadowBlur = 10;
			ctx.shadowColor = getBPMColor(wave.phase, 128, 210);
			ctx.strokeStyle = getBPMColor(wave.phase, 128, 210);
			ctx.stroke();
			ctx.shadowBlur = 0;
			wave.phase += 0.02 * deltaScale;
		};
		generator.start();
	};

	const startAudioSpectrogram = () => {
		const card = document.querySelector('[data-example="audioSpectrogram"]');
		if (!card) {
			return;
		}
		const canvas = card.querySelector("canvas");
		const button = card.querySelector("[data-action=audio-start]");
		const status = card.querySelector("[data-audio-status]");
		if (!canvas || !button || !status) {
			return;
		}
		const generator = createGenerator(canvas);
		generator.addWave({ amplitude: 1, wavelength: 1, speed: 0.05 });
		const ctx = generator.ctx;
		let analyser = null;
		let data = null;
		const setupAudio = async () => {
			try {
				const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				const source = audioCtx.createMediaStreamSource(stream);
				analyser = audioCtx.createAnalyser();
				analyser.fftSize = 128;
				data = new Uint8Array(analyser.frequencyBinCount);
				source.connect(analyser);
				status.textContent = "Live";
			} catch (error) {
				status.textContent = "Blocked";
			}
		};
		button.addEventListener("click", () => {
			if (!analyser) {
				status.textContent = "Listening";
				setupAudio();
			}
		});
		generator.drawWave = (wave, deltaScale = 1) => {
			const { width, height } = getSize(generator, canvas);
			if (analyser && data) {
				analyser.getByteFrequencyData(data);
			}
			const count = 64;
			const barWidth = width / count;
			ctx.lineWidth = 1.5;
			for (let i = 0; i < count; i += 1) {
				const idx = Math.floor((i / count) * (data ? data.length : count));
				const amp = data ? data[idx] / 255 : (Math.sin(wave.phase + i * 0.2) + 1) * 0.5;
				const amplitude = amp * (height * 0.3);
				const x = i * barWidth + barWidth * 0.5;
				const base = height * 0.5;
				ctx.beginPath();
				ctx.moveTo(x, base - amplitude);
				ctx.lineTo(x, base + amplitude);
				const hue = hueFromValue(amp, 180 + i);
				ctx.strokeStyle = `hsla(${hue}deg 80% 55% / 0.7)`;
				ctx.stroke();
			}
			wave.phase += 0.02 * deltaScale;
		};
		generator.start();
	};

	const boot = () => {
		if (typeof window.SineWaveGenerator !== "function") {
			setTimeout(boot, 50);
			return;
		}
		startFundamentals();
		startExample("pulseMatrix", 4, drawPulseMatrix);
		startExample("dnaHelix", 4, drawDNAHelix);
		startExample("fluidColumn", 4, drawFluidColumn);
		startExample("diagonalRain", 4, drawDiagonalRain);
		startExample("lissajousOrbit", 3, drawLissajousOrbit);
		startExample("lissajousExplorer", 4, drawLissajousExplorer);
		startExample("feedbackLoop", 4, drawFeedbackLoop);
		startExample("waveformTerrain", 6, drawWaveformTerrain);
		startExample("radialBloom", 4, drawRadialBloom);
		startExample("labOcean", 6, drawWaveformTerrain);
		startExample("labHelix", 4, drawDNAHelix);
		startExample("labPulse", 4, drawRadialBloom);
		startExample("labOrbit", 3, drawLissajousOrbit);
		startExample("moireInterference", 4, drawMoireInterference);
		startExample("kineticTypography", 4, drawKineticTypography);
		startExample("dampedSine", 4, drawDampedSine);
		startExample("recursiveSine", 4, drawRecursiveSine);
		startStringPhysics();
		startAudioSpectrogram();
	};

	document.addEventListener("DOMContentLoaded", () => {
		boot();
	});
})();
