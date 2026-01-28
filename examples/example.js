"use strict";

(() => {
	const TWO_PI = Math.PI * 2;

	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	// Respect reduced motion by slowing animations rather than stopping them.
	const motionScale = prefersReducedMotion ? 0.25 : 1;

	const clamp01 = (value) => Math.min(1, Math.max(0, value));

	const bpmToSpeed = (bpm, beatsPerCycle) =>
		bpm / (3600 * Math.max(1, beatsPerCycle));

	const hueFromValue = (value, base = 210) => (base + value * 140 + 360) % 360;

	const getBPMColor = (time, bpm = 128, baseHue = 210) => {
		const beatPhase = time * (bpm / 128);
		const pulse = (Math.sin(beatPhase) + 1) * 0.5;
		return `hsl(${(baseHue + pulse * 120) % 360}deg 75% 55%)`;
	};

	const getSize = (generator, canvas) => ({
		width: generator.displayWidth || canvas.clientWidth || canvas.width || 1,
		height:
			generator.displayHeight || canvas.clientHeight || canvas.height || 1,
	});

	const createErrorGuard = (label, card) => {
		let reported = false;
		return (error) => {
			if (reported) {
				return;
			}
			reported = true;
			console.error(`[sine-wave-generator] ${label} failed`, error);
			if (card) {
				const existing = card.querySelector(".demo-error");
				if (!existing) {
					const badge = document.createElement("span");
					badge.className = "demo-error";
					badge.textContent = "Demo stopped. Check console.";
					card.appendChild(badge);
				}
			}
		};
	};

	const setupNavToggle = () => {
		const header = document.querySelector(".site-header");
		const toggle = document.querySelector(".nav-toggle");
		if (!header || !toggle) {
			return;
		}
		toggle.addEventListener("click", () => {
			const isOpen = header.classList.toggle("nav-open");
			toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
		});
	};

	const setActiveNav = () => {
		const nav = document.getElementById("site-nav");
		if (!nav) {
			return;
		}
		const normalize = (value) => {
			if (!value) {
				return "/";
			}
			const trimmed = value
				.replace(/\/index\.html$/, "")
				.replace(/\/+$/, "");
			return trimmed === "" ? "/" : trimmed;
		};
		const current = normalize(window.location.pathname);
		const links = nav.querySelectorAll("a");
		links.forEach((link) => {
			const href = link.getAttribute("href");
			if (!href || href.startsWith("http")) {
				return;
			}
			const path = normalize(new URL(href, window.location.origin).pathname);
			const isRoot = path === "/";
			if ((isRoot && current === "/") || (!isRoot && current.startsWith(path))) {
				link.classList.add("is-active");
			}
		});
	};

	const addMotionNote = (card) => {
		if (!prefersReducedMotion || !card) {
			return;
		}
		if (card.querySelector(".motion-note")) {
			return;
		}
		const note = document.createElement("div");
		note.className = "motion-note";
		note.textContent = "Reduced motion is on.";
		card.appendChild(note);
	};

	const attachMotionToggle = (card, generator, startFn) => {
		if (!card || !generator) {
			return;
		}
		const actions =
			card.querySelector(".gallery-actions") ||
			card.querySelector(".controls") ||
			card;
		let button = card.querySelector('[data-action="toggle-motion"]');
		if (!button) {
			button = document.createElement("button");
			button.type = "button";
			button.className = "btn motion-toggle";
			button.setAttribute("data-action", "toggle-motion");
			actions.appendChild(button);
		}
		let isPaused = false;
		const updateLabel = () => {
			button.textContent = isPaused ? "Resume animation" : "Pause animation";
			button.setAttribute("aria-pressed", isPaused ? "true" : "false");
		};
		updateLabel();
		button.addEventListener("click", () => {
			if (!isPaused) {
				generator.stop();
				isPaused = true;
			} else {
				if (typeof startFn === "function") {
					startFn();
				} else {
					generator.start();
				}
				isPaused = false;
			}
			updateLabel();
		});
	};

	const addCanvasDescriptions = () => {
		const cards = document.querySelectorAll("[data-example]");
		cards.forEach((card) => {
			const canvas = card.querySelector("canvas");
			if (!canvas || canvas.getAttribute("aria-describedby")) {
				return;
			}
			const desc =
				card.querySelector(".gallery-head p") ||
				card.querySelector(":scope > p") ||
				card.querySelector("p");
			if (!desc) {
				return;
			}
			const id = `${card.dataset.example}-desc`;
			if (!document.getElementById(id)) {
				const span = document.createElement("span");
				span.className = "visually-hidden";
				span.id = id;
				span.textContent = desc.textContent.trim();
				card.appendChild(span);
			}
			canvas.setAttribute("aria-describedby", id);
		});
	};

	const addExampleMeta = () => {
		const meta = {
			pulseMatrix: {
				purpose: "Add rhythm to structured layouts.",
				why: "Grid interference reads as energy without visual noise.",
			},
			dnaHelix: {
				purpose: "Create depth with minimal geometry.",
				why: "Counterphase strands create instant parallax.",
			},
			fluidColumn: {
				purpose: "Give panels a liquid accent.",
				why: "Phase‑shifted columns feel organic at low cost.",
			},
			diagonalRain: {
				purpose: "Add direction and momentum.",
				why: "Angle‑based strokes imply motion without full particles.",
			},
			lissajousOrbit: {
				purpose: "Show elegant orbital motion.",
				why: "Dual frequencies trace stable paths.",
			},
			lissajousExplorer: {
				purpose: "Highlight complex motion quickly.",
				why: "Frequency offsets create rich loops.",
			},
			feedbackLoop: {
				purpose: "Communicate intensity shifts.",
				why: "Amplitude modulation builds visible dynamics.",
			},
			waveformTerrain: {
				purpose: "Create layered horizons.",
				why: "Depth‑shifted phases form terrain.",
			},
			radialBloom: {
				purpose: "Add a focal pulse.",
				why: "Radial rings peak on downbeats.",
			},
			gradientFill: {
				purpose: "Turn waves into shapes.",
				why: "Closed paths allow layered fills.",
			},
			audioVisualizerSim: {
				purpose: "Preview audio energy quickly.",
				why: "Simulated bins map cleanly to height.",
			},
			labOcean: {
				purpose: "Calm, cinematic backdrops.",
				why: "Layered horizons soften motion.",
			},
			labHelix: {
				purpose: "Add vertical depth cues.",
				why: "Helix strands imply 3D motion.",
			},
			labPulse: {
				purpose: "Create a steady heartbeat.",
				why: "Radial pulses read as rhythm.",
			},
			labOrbit: {
				purpose: "Show a clean orbital loop.",
				why: "Phase offsets keep the path stable.",
			},
			moireInterference: {
				purpose: "Build visual tension fast.",
				why: "Interference lines create moiré.",
			},
			kineticTypography: {
				purpose: "Animate type without heavy assets.",
				why: "Wave‑driven offsets add life.",
			},
			dampedSine: {
				purpose: "Show motion decay.",
				why: "Exponential damping reads as physics.",
			},
			recursiveSine: {
				purpose: "Show complex oscillation.",
				why: "Nested waves add richness.",
			},
			verticalWave: {
				purpose: "Create flowing ribbons.",
				why: "Layered offsets add parallax.",
			},
			dashArray: {
				purpose: "Introduce cadence and texture.",
				why: "Dash patterns add visual rhythm.",
			},
			variableWidth: {
				purpose: "Make motion feel alive.",
				why: "Width modulation tracks energy.",
			},
			compositingGlow: {
				purpose: "Add premium glow effects.",
				why: "Screen blending deepens color.",
			},
			zenMode: {
				purpose: "Calm, minimal background motion.",
				why: "Low‑contrast waves stay subtle.",
			},
		};
		document.querySelectorAll("[data-example]").forEach((card) => {
			if (!card.closest("#examples")) {
				return;
			}
			const key = card.dataset.example;
			const entry = meta[key];
			if (!entry || card.querySelector(".example-meta")) {
				return;
			}
			const wrap = document.createElement("div");
			wrap.className = "example-meta";
			const purpose = document.createElement("p");
			purpose.className = "meta-line";
			purpose.innerHTML = `<span>Purpose</span>${entry.purpose}`;
			const why = document.createElement("p");
			why.className = "meta-line";
			why.innerHTML = `<span>Why it works</span>${entry.why}`;
			wrap.appendChild(purpose);
			wrap.appendChild(why);
			const after =
				card.querySelector(".gallery-head") ||
				card.querySelector("h3") ||
				card.firstElementChild;
			if (after && after.parentNode) {
				after.parentNode.insertBefore(wrap, after.nextSibling);
			} else {
				card.appendChild(wrap);
			}
		});
	};

	const startRainbowFundamentals = () => {
		const card = document.querySelector('[data-example="rainbowFundamentals"]');
		if (!card) {
			return;
		}
		const canvas = card.querySelector("canvas");
		if (!canvas) {
			return;
		}
		const debugBadge = document.createElement("div");
		debugBadge.style.position = "absolute";
		debugBadge.style.top = "12px";
		debugBadge.style.right = "12px";
		debugBadge.style.padding = "6px 10px";
		debugBadge.style.background = "rgba(15, 23, 42, 0.7)";
		debugBadge.style.color = "#fff";
		debugBadge.style.fontSize = "12px";
		debugBadge.style.borderRadius = "999px";
		debugBadge.style.zIndex = "2";
		debugBadge.textContent = "rainbow: init";
		card.style.position = "relative";
		card.appendChild(debugBadge);
		try {
			const generator = createGenerator(canvas, { autoResize: true });
			// Disable built-in pointer phase updates so custom controls feel consistent.
			generator.unbindEvents();
			debugBadge.textContent = "rainbow: generator";
			addMotionNote(card);
			attachMotionToggle(card, generator);
			const rainbowOffsets = [0, 45, 90, 150, 210, 265, 320];
			const yOffsets = [-1, -0.7, -0.35, 0, 0.35, 0.7, 1];
			const baseSpeed = 0.014 * motionScale;
			const baseWavelength = 300;
			const baseAmplitude = 30;
			const rotateBase = 6;
			for (let i = 0; i < 7; i += 1) {
				const sign = i % 2 === 0 ? 1 : -1;
				generator.addWave({
					amplitude: baseAmplitude - i * 2,
					wavelength: baseWavelength - i * 14,
					speed: baseSpeed * (1 - i * 0.08),
					segmentLength: 5,
					rotate: (rotateBase + i * 1.5) % 360,
				});
				const wave = generator.waves[generator.waves.length - 1];
				wave._rotateDir = sign;
			}
			generator.waves.forEach((wave, index) => {
				wave._rainbowOffset = rainbowOffsets[index % rainbowOffsets.length];
				wave._rainbowIndex = index;
			});
			const updateGradient = (shift = 0) => {
				const width = generator.displayWidth || canvas.clientWidth || 1;
				const baseStops = [0, 40, 120, 200, 260, 300, 350];
				return (offset) => {
					const gradient = generator.ctx.createLinearGradient(0, 0, width, 0);
					gradient.addColorStop(
						0,
						`hsla(${(baseStops[0] + shift + offset) % 360}, 85%, 60%, 0.9)`,
					);
					gradient.addColorStop(
						0.16,
						`hsla(${(baseStops[1] + shift + offset) % 360}, 90%, 60%, 0.9)`,
					);
					gradient.addColorStop(
						0.33,
						`hsla(${(baseStops[2] + shift + offset) % 360}, 85%, 55%, 0.9)`,
					);
					gradient.addColorStop(
						0.5,
						`hsla(${(baseStops[3] + shift + offset) % 360}, 90%, 60%, 0.9)`,
					);
					gradient.addColorStop(
						0.66,
						`hsla(${(baseStops[4] + shift + offset) % 360}, 85%, 65%, 0.9)`,
					);
					gradient.addColorStop(
						0.83,
						`hsla(${(baseStops[5] + shift + offset) % 360}, 80%, 65%, 0.9)`,
					);
					gradient.addColorStop(
						1,
						`hsla(${(baseStops[6] + shift + offset) % 360}, 85%, 60%, 0.9)`,
					);
					return gradient;
				};
			};
			const originalResize = generator.resize.bind(generator);
			generator.resize = () => {
				const result = originalResize();
				generator._gradientFactory = updateGradient();
				return result;
			};
			generator.drawWave = (wave, deltaScale = 1) => {
				const ctx = generator.ctx;
				if (!generator._gradientFactory) {
					generator._gradientFactory = updateGradient();
				}
				const shift = (wave.phase * 12) % 360;
				wave.strokeStyle = generator._gradientFactory(
					(shift + (wave._rainbowOffset || 0)) % 360,
				);
				const index = wave._rainbowIndex || 0;
				if (typeof generator._spinPhase !== "number") {
					generator._spinPhase = wave.phase;
				}
				if (index === 0) {
					generator._spinPhase += 0.09 * deltaScale;
				}
				const spinPhase = generator._spinPhase + index * 0.7;
				if (typeof generator._centerY !== "number") {
					generator._centerY = generator.displayHeight * 0.5;
					generator._centerYTarget = generator._centerY;
				}
				if (typeof generator._phaseOffset !== "number") {
					generator._phaseOffset = 0;
					generator._phaseOffsetTarget = 0;
				}
				generator._centerY +=
					(generator._centerYTarget - generator._centerY) * 0.08;
				generator._phaseOffset +=
					(generator._phaseOffsetTarget - generator._phaseOffset) * 0.08;
				const centerY = generator._centerY;
				const orbit = Math.sin(spinPhase);
				const depth = (Math.cos(spinPhase) + 1) * 0.5;
				const sweep =
					Math.sin(spinPhase * 0.5 + index * 0.15) *
					(generator.displayHeight * 0.28);
				const offsetY =
					yOffsets[index % yOffsets.length] + orbit * 12 + sweep;
				ctx.save();
				ctx.translate(0, centerY + offsetY);
				ctx.scale(1, 0.3 + depth * 0.7);
				ctx.translate(0, -centerY);
				ctx.shadowBlur = 20;
				ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
				ctx.globalAlpha = 0.45 + depth * 0.55;
				ctx.beginPath();
				const width = generator.displayWidth;
				const height = generator.displayHeight;
				const mid = height * 0.5;
				const overscan = Math.max(48, width * 0.18);
				const span = width + overscan * 2;
				const segment = Math.max(1, Math.round(wave.segmentLength || 6));
				const golden = 1.61803398875;
				const goldenEasing = (p, amp) => {
					const t = Math.min(1, Math.max(0, p));
					const band = Math.sin(t * Math.PI * golden);
					return amp * band;
				};
				const easing = wave.easing || goldenEasing;
				const baseAmp = Math.min(
					height * 0.34,
					wave.amplitude * Math.max(1.2, height / 160),
				);
				for (let x = -overscan; x <= width + overscan; x += segment) {
					const percent = (x + overscan) / span;
					const amp = easing(percent, baseAmp * orbit);
					const y =
						Math.sin(
							percent * TWO_PI + wave.phase + generator._phaseOffset,
						) *
							amp +
						mid;
					if (x === -overscan) {
						ctx.moveTo(x, y);
					} else {
						ctx.lineTo(x, y);
					}
				}
				ctx.strokeStyle = wave.strokeStyle;
				ctx.lineWidth = 2.2;
				ctx.stroke();
				ctx.restore();
				return generator;
			};
			let startAttempts = 0;
			let frames = 0;
			const updateBadge = (label) => {
				debugBadge.textContent = `rainbow: ${label} | ${frames}f`;
			};
			const manualStart = () => {
				if (generator.animationFrameId) {
					updateBadge("already");
					return;
				}
				let lastTime = performance.now();
				const tick = (time) => {
					const delta = Math.min(
						5,
						Math.max(0.2, (time - lastTime) / 16.67),
					);
					lastTime = time;
					generator.resize();
					generator.ctx.clearRect(
						0,
						0,
						generator.displayWidth,
						generator.displayHeight,
					);
					generator.waves.forEach((wave) => generator.drawWave(wave, delta));
					frames += 1;
					if (frames % 30 === 0) {
						updateBadge(
							`manual ${generator.displayWidth}x${generator.displayHeight}`,
						);
					}
					generator.animationFrameId = requestAnimationFrame(tick);
				};
				updateBadge("manual start");
				generator.animationFrameId = requestAnimationFrame(tick);
			};
			const start = () => {
				generator.resize();
				generator.start();
				updateBadge(
					`start ${generator.displayWidth}x${generator.displayHeight}`,
				);
				if (!generator.animationFrameId && startAttempts < 6) {
					startAttempts += 1;
					setTimeout(start, 200);
				}
				if (!generator.animationFrameId && startAttempts >= 6) {
					manualStart();
				}
			};
			observeStart(canvas, start);
			requestAnimationFrame(start);
			setTimeout(start, 0);
			window.addEventListener("load", start, { once: true });
			updateBadge("armed");
			let pointerActive = false;
			const updateCenterFromEvent = (event) => {
				const rect = canvas.getBoundingClientRect();
				const nextY = Math.min(
					rect.height,
					Math.max(0, event.clientY - rect.top),
				);
				const nextX = Math.min(
					rect.width,
					Math.max(0, event.clientX - rect.left),
				);
				const xPercent = rect.width > 0 ? nextX / rect.width : 0;
				generator._centerYTarget = nextY;
				generator._phaseOffsetTarget = xPercent * TWO_PI;
			};
			canvas.addEventListener("pointerdown", (event) => {
				pointerActive = true;
				canvas.setPointerCapture?.(event.pointerId);
				updateCenterFromEvent(event);
			});
			canvas.addEventListener(
				"pointermove",
				(event) => {
					if (!pointerActive) {
						return;
					}
					updateCenterFromEvent(event);
				},
				{ passive: true },
			);
			canvas.addEventListener("pointerup", (event) => {
				pointerActive = false;
				canvas.releasePointerCapture?.(event.pointerId);
			});
			canvas.addEventListener("pointerleave", () => {
				pointerActive = false;
			});
			const phaseBaseline = generator.waves[0]?.phase ?? 0;
			setTimeout(() => {
				const currentPhase = generator.waves[0]?.phase ?? 0;
				if (currentPhase === phaseBaseline) {
					manualStart();
				}
			}, 800);
			if (generator.displayWidth === 0 || generator.displayHeight === 0) {
				const ro = new ResizeObserver(() => {
					generator.resize();
					if (generator.displayWidth > 0 && generator.displayHeight > 0) {
						start();
						ro.disconnect();
					}
				});
				ro.observe(card);
			}
		} catch (error) {
			console.error("[rainbowFundamentals]", error);
			const message =
				error && typeof error.message === "string"
					? error.message
					: String(error);
			debugBadge.textContent = `rainbow: ${message}`.slice(0, 80);
		} finally {
			debugBadge.remove();
		}
	};

	const setupSearch = () => {
		const inputs = document.querySelectorAll("[data-search]");
		inputs.forEach((input) => {
			const mode = input.getAttribute("data-search");
			const getItems = () => {
				if (mode === "examples") {
					return Array.from(document.querySelectorAll("[data-example]"));
				}
				if (mode === "api") {
					return Array.from(
						document.querySelectorAll(".cheat-table tbody tr"),
					);
				}
				return [];
			};
			const items = getItems();
			if (items.length === 0) {
				return;
			}
			input.addEventListener("input", () => {
				const query = input.value.trim().toLowerCase();
				items.forEach((item) => {
					const text = item.textContent.toLowerCase();
					const match = query === "" || text.includes(query);
					item.style.display = match ? "" : "none";
				});
			});
		});
	};

	const observeStart = (canvas, startFn) => {
		if (!canvas || typeof startFn !== "function") {
			return;
		}
		const isInView = () => {
			const rect = canvas.getBoundingClientRect();
			return rect.bottom >= 0 && rect.top <= window.innerHeight;
		};
		let started = false;
		let observer = null;
		let fallbackTimer = null;
		const startOnce = () => {
			if (started) {
				return;
			}
			started = true;
			if (observer) {
				observer.disconnect();
			}
			if (fallbackTimer) {
				clearTimeout(fallbackTimer);
			}
			startFn();
		};
		if (isInView()) {
			startOnce();
			return;
		}
		if (!("IntersectionObserver" in window)) {
			startOnce();
			return;
		}
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						startOnce();
					}
				});
			},
			{ threshold: 0.2 },
		);
		observer.observe(canvas);
		fallbackTimer = setTimeout(() => {
			if (isInView()) {
				startOnce();
			}
		}, 1200);
	};

	const setupControls = (card) => {
		const controls = {
			bpm: 96,
			amplitude: 16,
			frequency: 8,
			phase: 0,
			volume: 60,
		};
		const inputs = Array.from(card.querySelectorAll("[data-control]"));
		inputs.forEach((input) => {
			const key = input.dataset.control;
			if (input.tagName === "SELECT") {
				controls[key] = input.value;
				input.addEventListener("change", () => {
					controls[key] = input.value;
				});
				return;
			}
			if (input.type === "color") {
				controls[key] = input.value;
				input.addEventListener("input", () => {
					controls[key] = input.value;
				});
				return;
			}
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
		const reportError = createErrorGuard(id, card);
		addMotionNote(card);
		generator.addWave({ amplitude: 1, wavelength: 1, speed: 0.05 });
		const ctx = generator.ctx;
		let started = false;
		generator.drawWave = (wave, deltaScale = 1) => {
			try {
				const speed = bpmToSpeed(controls.bpm, beatsPerCycle) * motionScale;
				const time = wave.phase + (controls.phase * Math.PI) / 180;
				draw({ ctx, canvas, generator, controls, time });
				wave.phase += speed * TWO_PI * deltaScale;
			} catch (error) {
				reportError(error);
				generator.stop();
			}
		};
		const start = () => {
			started = true;
			generator.start();
		};
		observeStart(canvas, start);
		attachMotionToggle(card, generator, () => {
			if (!started) {
				start();
				return;
			}
			generator.start();
		});
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
		const lazyStart = (canvas, generator) => {
			observeStart(canvas, () => generator.start());
		};

		const basic = document.getElementById("sineCanvasBasic");
		if (basic) {
			const generator = createGenerator(basic);
			generator.addWave({
				amplitude: 22,
				wavelength: 160,
				speed: 0.05 * motionScale,
				segmentLength: 10,
				strokeStyle: "hsla(0deg 80% 60% / 0.75)",
			});
			generator.addWave({
				amplitude: 16,
				wavelength: 200,
				speed: 0.04 * motionScale,
				segmentLength: 12,
				strokeStyle: "hsla(120deg 80% 60% / 0.65)",
			});
			generator.addWave({
				amplitude: 12,
				wavelength: 120,
				speed: 0.06 * motionScale,
				segmentLength: 8,
				strokeStyle: "hsla(220deg 80% 60% / 0.65)",
			});
			lazyStart(basic, generator);
		}

		const multi = document.getElementById("sineCanvasMulti");
		if (multi) {
			const generator = createGenerator(multi);
			generator.addWave({
				amplitude: 18,
				wavelength: 140,
				speed: 0.04 * motionScale,
				segmentLength: 10,
			});
			generator.addWave({
				amplitude: 28,
				wavelength: 200,
				speed: 0.035 * motionScale,
				segmentLength: 12,
				strokeStyle: "rgba(14,165,233,0.5)",
			});
			generator.addWave({
				amplitude: 12,
				wavelength: 90,
				speed: 0.05 * motionScale,
				segmentLength: 8,
				strokeStyle: "rgba(15,23,42,0.35)",
			});
			lazyStart(multi, generator);
		}

		const pointer = document.getElementById("sineCanvasPointer");
		if (pointer) {
			const generator = createGenerator(pointer);
			generator.addWave({
				amplitude: 32,
				wavelength: 180,
				speed: 0.045 * motionScale,
				segmentLength: 8,
			});
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
			lazyStart(pointer, generator);
		}

		const dynamic = document.getElementById("sineCanvasDynamic");
		if (dynamic) {
			const generator = createGenerator(dynamic);
			const waveStack = [
				{
					amplitude: 12,
					wavelength: 100,
					speed: 0.035 * motionScale,
					segmentLength: 10,
				},
				{
					amplitude: 20,
					wavelength: 140,
					speed: 0.04 * motionScale,
					segmentLength: 10,
				},
				{
					amplitude: 28,
					wavelength: 180,
					speed: 0.045 * motionScale,
					segmentLength: 10,
				},
				{
					amplitude: 36,
					wavelength: 220,
					speed: 0.05 * motionScale,
					segmentLength: 12,
				},
				{
					amplitude: 18,
					wavelength: 120,
					speed: 0.038 * motionScale,
					segmentLength: 8,
				},
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
			observeStart(dynamic, () => {
				addWave();
				generator.start();
			});
		}

		const performance = document.getElementById("sineCanvasPerformance");
		if (performance) {
			const generator = createGenerator(performance, { maxPixelRatio: 1 });
			generator.addWave({
				amplitude: 18,
				wavelength: 160,
				speed: 0.035 * motionScale,
				segmentLength: 14,
			});
			generator.addWave({
				amplitude: 10,
				wavelength: 120,
				speed: 0.04 * motionScale,
				segmentLength: 16,
			});
			generator.addWave({
				amplitude: 6,
				wavelength: 90,
				speed: 0.045 * motionScale,
				segmentLength: 18,
			});
			lazyStart(performance, generator);
		}

		const easing = document.getElementById("sineCanvasEasing");
		if (easing) {
			const generator = createGenerator(easing);
			generator.addWave({
				amplitude: 30,
				wavelength: 160,
				speed: 0.04 * motionScale,
				segmentLength: 10,
				easing: easedSine,
			});
			lazyStart(easing, generator);
		}

		const pause = document.getElementById("sineCanvasPause");
		if (pause) {
			const generator = createGenerator(pause);
			generator.addWave({
				amplitude: 24,
				wavelength: 150,
				speed: 0.04 * motionScale,
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
			lazyStart(pause, generator);
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
			const x = centerX + Math.sin(t * freq + time) * amplitude * 0.9;
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

	const drawLissajousExplorer = ({
		ctx,
		canvas,
		controls,
		time,
		generator,
	}) => {
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

	const drawMoireInterference = ({
		ctx,
		canvas,
		controls,
		time,
		generator,
	}) => {
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

	const drawKineticTypography = ({
		ctx,
		canvas,
		controls,
		time,
		generator,
	}) => {
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
			ctx.fillText(char, width * 0.5 + offset * 18, height * 0.5 + wave);
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

	/* --- New demos --- */

	const drawGradientFill = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerY = height * 0.5;
		const amplitude = controls.amplitude;
		const freq = controls.frequency * 0.03;
		const gradient = ctx.createLinearGradient(
			0,
			centerY - amplitude,
			0,
			height,
		);
		gradient.addColorStop(0, "rgba(14, 165, 233, 0.6)");
		gradient.addColorStop(0.5, "rgba(14, 165, 233, 0.2)");
		gradient.addColorStop(1, "rgba(14, 165, 233, 0)");
		ctx.beginPath();
		ctx.moveTo(0, height);
		for (let x = 0; x <= width; x += 4) {
			const value = Math.sin(x * freq + time);
			const y = centerY + value * amplitude;
			ctx.lineTo(x, y);
		}
		ctx.lineTo(width, height);
		ctx.closePath();
		ctx.fillStyle = gradient;
		ctx.fill();
		ctx.beginPath();
		for (let x = 0; x <= width; x += 4) {
			const value = Math.sin(x * freq + time);
			const y = centerY + value * amplitude;
			if (x === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.strokeStyle = "rgba(14, 165, 233, 0.8)";
		ctx.lineWidth = 2;
		ctx.stroke();
	};

	const drawAudioVisualizerSim = ({
		ctx,
		canvas,
		controls,
		time,
		generator,
	}) => {
		const { width, height } = getSize(generator, canvas);
		const centerY = height * 0.5;
		const volumeFactor = (controls.volume || 60) / 100;
		const amplitude = controls.amplitude * volumeFactor;
		const waveConfigs = [
			{ freq: 0.02, speed: 1.0, hue: 200, alpha: 0.7 },
			{ freq: 0.035, speed: 1.4, hue: 240, alpha: 0.5 },
			{ freq: 0.05, speed: 0.8, hue: 280, alpha: 0.4 },
			{ freq: 0.015, speed: 1.8, hue: 320, alpha: 0.3 },
		];
		waveConfigs.forEach((cfg) => {
			ctx.beginPath();
			for (let x = 0; x <= width; x += 4) {
				const value = Math.sin(x * cfg.freq + time * cfg.speed);
				const y = centerY + value * amplitude;
				if (x === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			ctx.strokeStyle = `hsla(${cfg.hue}deg 75% 55% / ${cfg.alpha})`;
			ctx.lineWidth = 1.5 + volumeFactor;
			ctx.stroke();
		});
	};

	const drawHeroBackground = ({ ctx, canvas, generator, time }) => {
		const { width, height } = getSize(generator, canvas);
		const centerY = height * 0.5;
		const waveConfigs = [
			{ amplitude: 15, freq: 0.008, speed: 0.3, alpha: 0.12 },
			{ amplitude: 10, freq: 0.012, speed: 0.2, alpha: 0.08 },
			{ amplitude: 8, freq: 0.006, speed: 0.4, alpha: 0.1 },
		];
		waveConfigs.forEach((cfg) => {
			ctx.beginPath();
			for (let x = 0; x <= width; x += 8) {
				const value = Math.sin(x * cfg.freq + time * cfg.speed);
				const y = centerY + value * cfg.amplitude;
				if (x === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			ctx.strokeStyle = `rgba(14, 165, 233, ${cfg.alpha})`;
			ctx.lineWidth = 1.5;
			ctx.stroke();
		});
	};

	const drawVerticalWave = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerX = width * 0.5;
		const amplitude = controls.amplitude;
		const freq = controls.frequency * 0.03;
		for (let layer = 0; layer < 3; layer++) {
			ctx.beginPath();
			for (let y = 0; y <= height; y += 4) {
				const value = Math.sin(y * freq + time + layer * 0.8);
				const x = centerX + value * amplitude * (1 - layer * 0.25);
				if (y === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			const hue = hueFromValue(layer / 3, 200);
			ctx.strokeStyle = `hsla(${hue}deg 75% 55% / ${0.8 - layer * 0.2})`;
			ctx.lineWidth = 2 - layer * 0.4;
			ctx.stroke();
		}
	};

	const drawDashArray = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerY = height * 0.5;
		const amplitude = controls.amplitude;
		const freq = controls.frequency * 0.03;
		const dashPatterns = [
			[12, 6],
			[4, 8],
			[20, 4, 4, 4],
		];
		dashPatterns.forEach((pattern, i) => {
			ctx.beginPath();
			ctx.setLineDash(pattern);
			for (let x = 0; x <= width; x += 4) {
				const value = Math.sin(x * freq + time + i * 1.2);
				const y = centerY + value * amplitude * (1 - i * 0.2) + (i - 1) * 20;
				if (x === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			const hue = hueFromValue(i / 3, 210);
			ctx.strokeStyle = `hsla(${hue}deg 70% 55% / 0.8)`;
			ctx.lineWidth = 2;
			ctx.stroke();
		});
		ctx.setLineDash([]);
	};

	const drawVariableWidth = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerY = height * 0.5;
		const amplitude = controls.amplitude;
		const freq = controls.frequency * 0.025;
		const step = 6;
		for (let x = 0; x < width - step; x += step) {
			const v1 = Math.sin(x * freq + time);
			const v2 = Math.sin((x + step) * freq + time);
			const y1 = centerY + v1 * amplitude;
			const y2 = centerY + v2 * amplitude;
			const thickness = 1 + Math.abs(Math.sin(x * 0.01 + time * 2)) * 4;
			const hue = hueFromValue(v1, 220);
			ctx.beginPath();
			ctx.moveTo(x, y1);
			ctx.lineTo(x + step, y2);
			ctx.strokeStyle = `hsla(${hue}deg 75% 55% / 0.85)`;
			ctx.lineWidth = thickness;
			ctx.stroke();
		}
	};

	const drawCompositingGlow = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerY = height * 0.5;
		const amplitude = controls.amplitude;
		const freq = controls.frequency * 0.025;
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		const colors = [
			{ hue: 200, offset: 0 },
			{ hue: 260, offset: 1.2 },
			{ hue: 320, offset: 2.4 },
		];
		colors.forEach((cfg) => {
			ctx.beginPath();
			for (let x = 0; x <= width; x += 4) {
				const value = Math.sin(x * freq + time + cfg.offset);
				const y = centerY + value * amplitude;
				if (x === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			ctx.strokeStyle = `hsla(${cfg.hue}deg 90% 60% / 0.6)`;
			ctx.lineWidth = 3;
			ctx.shadowBlur = 20;
			ctx.shadowColor = `hsla(${cfg.hue}deg 90% 60% / 0.5)`;
			ctx.stroke();
		});
		ctx.restore();
	};

	const drawZenMode = ({ ctx, canvas, controls, time, generator }) => {
		const { width, height } = getSize(generator, canvas);
		const centerY = height * 0.5;
		const amplitude = controls.amplitude;
		const freq = controls.frequency * 0.015;
		ctx.beginPath();
		for (let x = 0; x <= width; x += 6) {
			const value = Math.sin(x * freq + time * 0.15);
			const y = centerY + value * amplitude;
			if (x === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.strokeStyle = "rgba(14, 165, 233, 0.5)";
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.beginPath();
		for (let x = 0; x <= width; x += 6) {
			const value = Math.sin(x * freq * 0.7 + time * 0.1 + 1.5);
			const y = centerY + value * amplitude * 0.6;
			if (x === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.strokeStyle = "rgba(14, 165, 233, 0.25)";
		ctx.lineWidth = 1.5;
		ctx.stroke();
	};

	/* --- String physics --- */

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
		generator.addWave({
			amplitude: 1,
			wavelength: 1,
			speed: 0.08 * motionScale,
		});
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
			wave.phase += 0.02 * deltaScale * motionScale;
		};
		observeStart(canvas, () => generator.start());
	};

	/* --- Audio spectrogram --- */

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
		generator.addWave({
			amplitude: 1,
			wavelength: 1,
			speed: 0.05 * motionScale,
		});
		const ctx = generator.ctx;
		let analyser = null;
		let data = null;
		const setupAudio = async () => {
			try {
				const audioCtx = new (
					window.AudioContext || window.webkitAudioContext
				)();
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				const source = audioCtx.createMediaStreamSource(stream);
				analyser = audioCtx.createAnalyser();
				analyser.fftSize = 128;
				data = new Uint8Array(analyser.frequencyBinCount);
				source.connect(analyser);
				status.textContent = "Live";
			} catch {
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
				const amp = data
					? data[idx] / 255
					: (Math.sin(wave.phase + i * 0.2) + 1) * 0.5;
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
			wave.phase += 0.02 * deltaScale * motionScale;
		};
		observeStart(canvas, () => generator.start());
	};

	/* --- Responsive resize demo --- */

	const startResponsiveResize = () => {
		const canvas = document.getElementById("responsiveResizeCanvas");
		if (!canvas) {
			return;
		}
		const generator = createGenerator(canvas, { autoResize: true });
		generator.addWave({
			amplitude: 24,
			wavelength: 140,
			speed: 0.04 * motionScale,
			segmentLength: 10,
		});
		generator.addWave({
			amplitude: 16,
			wavelength: 200,
			speed: 0.03 * motionScale,
			segmentLength: 12,
			strokeStyle: "rgba(14,165,233,0.4)",
		});
		const container = canvas.parentElement;
		if (container) {
			const ro = new ResizeObserver(() => {
				generator.resize();
			});
			ro.observe(container);
		}
		observeStart(canvas, () => generator.start());
	};

	/* --- Hero background --- */

	const startHeroBackground = () => {
		const canvas = document.getElementById("heroBackgroundCanvas");
		if (!canvas) {
			return;
		}
		const generator = createGenerator(canvas, { autoResize: true });
		generator.addWave({ amplitude: 1, wavelength: 1, speed: 0.02 });
		const ctx = generator.ctx;
		generator.drawWave = (wave, deltaScale = 1) => {
			const time = wave.phase;
			drawHeroBackground({ ctx, canvas, generator, time });
			wave.phase += 0.01 * deltaScale * motionScale;
		};
		generator.start();
	};

	/* --- Playground --- */

	const startPlayground = () => {
		const canvas = document.getElementById("playgroundCanvas");
		if (!canvas) {
			return;
		}
		const card = canvas.closest(".playground-card");
		if (!card) {
			return;
		}
		const controls = setupControls(card);
		const generator = createGenerator(canvas);
		addMotionNote(card);
		attachMotionToggle(card, generator);

		const easingFunctions = {
			sineInOut: (percent, amp) =>
				(amp * (Math.sin(percent * Math.PI) + 1)) / 2,
			sineIn: (percent, amp) => amp * (1 - Math.cos((percent * Math.PI) / 2)),
			sineOut: (percent, amp) => amp * Math.sin((percent * Math.PI) / 2),
			linear: (percent, amp) => amp * percent,
		};

		const PRESETS = {
			ocean: {
				waveCount: 3,
				amplitude: 20,
				wavelength: 280,
				speed: 0.4,
				segmentLength: 10,
				easing: "sineInOut",
			},
			heartbeat: {
				waveCount: 1,
				amplitude: 60,
				wavelength: 80,
				speed: 2.0,
				segmentLength: 6,
				easing: "sineIn",
			},
			highfreq: {
				waveCount: 4,
				amplitude: 15,
				wavelength: 40,
				speed: 1.5,
				segmentLength: 4,
				easing: "linear",
			},
			stormy: {
				waveCount: 5,
				amplitude: 50,
				wavelength: 120,
				speed: 2.5,
				segmentLength: 8,
				easing: "sineOut",
			},
		};

		const presetSelect = document.getElementById("playgroundPreset");
		if (presetSelect) {
			presetSelect.addEventListener("change", () => {
				const preset = PRESETS[presetSelect.value];
				if (!preset) {
					return;
				}
				const sliders = card.querySelectorAll("[data-control]");
				sliders.forEach((input) => {
					const key = input.dataset.control;
					if (key === "preset" || key === "strokeColor") {
						return;
					}
					if (preset[key] !== undefined) {
						input.value = preset[key];
						input.dispatchEvent(new Event("input", { bubbles: true }));
					}
				});
				const easingSel = card.querySelector('[data-control="easing"]');
				if (easingSel && preset.easing) {
					easingSel.value = preset.easing;
					easingSel.dispatchEvent(new Event("change", { bubbles: true }));
				}
			});
		}

		const syncWaves = () => {
			const desiredCount = Number(controls.waveCount) || 2;
			const amp = Number(controls.amplitude) || 30;
			const wl = Number(controls.wavelength) || 140;
			const spd = Number(controls.speed) || 0.8;
			const seg = Number(controls.segmentLength) || 10;
			const easingKey = controls.easing || "sineInOut";
			const easingFn = easingFunctions[easingKey] || easingFunctions.sineInOut;
			const color = controls.strokeColor || null;

			while (generator.waves.length > desiredCount) {
				generator.removeWave(generator.waves.length - 1);
			}
			while (generator.waves.length < desiredCount) {
				generator.addWave({
					amplitude: amp,
					wavelength: wl,
					speed: spd * 0.05,
					segmentLength: seg,
					easing: easingFn,
					strokeStyle: color,
				});
			}
			generator.waves.forEach((wave, i) => {
				wave.amplitude = amp;
				wave.wavelength = wl + i * 30;
				wave.speed = spd * 0.05 * motionScale;
				wave.segmentLength = seg;
				wave.easing = easingFn;
				wave.strokeStyle = color;
			});
		};

		card.addEventListener("input", syncWaves);
		card.addEventListener("change", syncWaves);
		syncWaves();

		const copyBtn = document.getElementById("playgroundCopyConfig");
		if (copyBtn) {
			copyBtn.addEventListener("click", () => {
				const easingKey = controls.easing || "sineInOut";
				const waves = [];
				const count = Number(controls.waveCount) || 2;
				for (let i = 0; i < count; i++) {
					waves.push(
						`    { amplitude: ${controls.amplitude}, wavelength: ${Number(controls.wavelength) + i * 30}, speed: ${controls.speed}, segmentLength: ${controls.segmentLength}, easing: Ease.${easingKey}${controls.strokeColor ? `, strokeStyle: "${controls.strokeColor}"` : ""} }`,
					);
				}
				const snippet = `const generator = new SineWaveGenerator({\n  el: "#myCanvas",\n  waves: [\n${waves.join(",\n")}\n  ]\n});\ngenerator.start();`;
				copyToClipboard(snippet, copyBtn);
			});
		}

		const fullscreenBtn = document.getElementById("playgroundFullscreen");
		if (fullscreenBtn) {
			fullscreenBtn.addEventListener("click", () => {
				card.classList.toggle("is-fullscreen");
				fullscreenBtn.textContent = card.classList.contains("is-fullscreen")
					? "Exit Fullscreen"
					: "Fullscreen";
				generator.resize();
			});
		}

		generator.start();
	};

	/* --- Scroll reactive guide --- */

	const startHeroBackgroundGuide = () => {
		const card = document.querySelector('[data-example="heroBackgroundGuide"]');
		if (!card) {
			return;
		}
		const canvas = card.querySelector("canvas");
		if (!canvas) {
			return;
		}
		const generator = createGenerator(canvas, { autoResize: true });
		addMotionNote(card);
		attachMotionToggle(card, generator);
		generator.addWave({
			amplitude: 14,
			wavelength: 200,
			speed: 0.03 * motionScale,
			segmentLength: 10,
			strokeStyle: "rgba(14, 165, 233, 0.45)",
		});
		generator.addWave({
			amplitude: 8,
			wavelength: 140,
			speed: 0.02 * motionScale,
			segmentLength: 12,
			strokeStyle: "rgba(124, 58, 237, 0.2)",
		});
		observeStart(canvas, () => generator.start());
	};

	const startScrollReactive = () => {
		const card = document.querySelector('[data-example="scrollReactive"]');
		if (!card) {
			return;
		}
		const canvas = card.querySelector("canvas");
		if (!canvas) {
			return;
		}
		const generator = createGenerator(canvas, { autoResize: true });
		addMotionNote(card);
		attachMotionToggle(card, generator);
		generator.addWave({
			amplitude: 18,
			wavelength: 180,
			speed: 0.04 * motionScale,
			segmentLength: 10,
		});
		const updateFromScroll = () => {
			const total = document.documentElement.scrollHeight - window.innerHeight;
			const progress = total > 0 ? clamp01(window.scrollY / total) : 0;
			const amp = 10 + 30 * progress;
			const wl = 140 + 240 * (1 - progress);
			generator.waves.forEach((wave) => {
				wave.amplitude = amp;
				wave.wavelength = wl;
			});
		};
		let rafId = null;
		const onScroll = () => {
			if (rafId) {
				return;
			}
			rafId = requestAnimationFrame(() => {
				rafId = null;
				updateFromScroll();
			});
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		updateFromScroll();
		observeStart(canvas, () => generator.start());
	};

	/* --- Quality presets guide --- */

	const startQualityPresets = () => {
		const card = document.querySelector('[data-example="qualityPresets"]');
		if (!card) {
			return;
		}
		const canvas = card.querySelector("canvas");
		if (!canvas) {
			return;
		}
		const generator = createGenerator(canvas, { autoResize: true });
		addMotionNote(card);
		attachMotionToggle(card, generator);
		generator.addWave({
			amplitude: 22,
			wavelength: 160,
			speed: 0.04 * motionScale,
			segmentLength: 10,
		});
		const buttons = Array.from(card.querySelectorAll("[data-quality]"));
		const status =
			card.querySelector("[data-quality-status]") ||
			(() => {
				const el = document.createElement("div");
				el.className = "quality-status";
				card.appendChild(el);
				return el;
			})();
		const setActive = (preset) => {
			buttons.forEach((btn) => {
				btn.classList.toggle(
					"is-active",
					btn.getAttribute("data-quality") === preset,
				);
			});
			status.textContent = `Quality preset: ${preset}`;
		};
		buttons.forEach((button) => {
			button.addEventListener("click", () => {
				const preset = button.getAttribute("data-quality");
				if (!preset) {
					return;
				}
				generator.setQualityPreset(preset);
				setActive(preset);
			});
		});
		setActive("balanced");
		observeStart(canvas, () => generator.start());
	};

	/* --- Dark/light mode toggle --- */

	const setupThemeToggle = () => {
		const toggle = document.getElementById("themeToggle");
		if (!toggle) {
			return;
		}
		const stored = localStorage.getItem("theme");
		if (stored) {
			document.documentElement.setAttribute("data-theme", stored);
		} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			document.documentElement.setAttribute("data-theme", "dark");
		}
		toggle.addEventListener("click", () => {
			const current = document.documentElement.getAttribute("data-theme");
			const next = current === "dark" ? "light" : "dark";
			document.documentElement.setAttribute("data-theme", next);
			localStorage.setItem("theme", next);
		});
	};

	/* --- Copy to clipboard --- */

	const copyToClipboard = (text, button) => {
		const doCopy = () => {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				return navigator.clipboard.writeText(text);
			}
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			return Promise.resolve();
		};
		doCopy().then(() => {
			if (button) {
				const original = button.textContent;
				button.textContent = "Copied!";
				button.classList.add("copied");
				setTimeout(() => {
					button.textContent = original;
					button.classList.remove("copied");
				}, 2000);
			}
		});
	};

	const setupCopyButtons = () => {
		const codeBlocks = document.querySelectorAll(".code-block");
		codeBlocks.forEach((block) => {
			if (block.querySelector(".copy-btn")) {
				return;
			}
			block.style.position = "relative";
			const btn = document.createElement("button");
			btn.className = "copy-btn";
			btn.type = "button";
			btn.textContent = "Copy";
			btn.addEventListener("click", (e) => {
				e.stopPropagation();
				const code = block.querySelector("code");
				const text = code ? code.textContent : block.textContent;
				copyToClipboard(text, btn);
			});
			block.appendChild(btn);
		});
	};

	/* --- View code toggles --- */

	const setupViewCodeToggles = () => {
		const toggles = document.querySelectorAll(".view-code-toggle");
		toggles.forEach((btn) => {
			btn.addEventListener("click", () => {
				const reveal = btn.nextElementSibling;
				if (reveal && reveal.classList.contains("code-reveal")) {
					const isVisible = reveal.classList.toggle("is-visible");
					btn.textContent = isVisible ? "Hide Code" : "View Code";
				}
			});
		});
	};

	/* --- Boot --- */

	const boot = () => {
		if (typeof window.SineWaveGenerator !== "function") {
			setTimeout(boot, 50);
			return;
		}
		setupThemeToggle();
		const overlay = document.getElementById("loadingOverlay");
		if (overlay) {
			overlay.classList.add("is-hidden");
			setTimeout(() => overlay.remove(), 300);
		}
		setupNavToggle();
		setActiveNav();
		addCanvasDescriptions();
		addExampleMeta();
		setupSearch();
		const safeCall = (fn) => {
			try {
				fn();
			} catch (e) {
				console.error("[boot]", e);
			}
		};
		safeCall(() => startFundamentals());
		safeCall(() => startExample("pulseMatrix", 4, drawPulseMatrix));
		safeCall(() => startExample("dnaHelix", 4, drawDNAHelix));
		safeCall(() => startExample("fluidColumn", 4, drawFluidColumn));
		safeCall(() => startExample("diagonalRain", 4, drawDiagonalRain));
		safeCall(() => startExample("lissajousOrbit", 3, drawLissajousOrbit));
		safeCall(() => startExample("lissajousExplorer", 4, drawLissajousExplorer));
		safeCall(() => startExample("feedbackLoop", 4, drawFeedbackLoop));
		safeCall(() => startExample("waveformTerrain", 6, drawWaveformTerrain));
		safeCall(() => startExample("radialBloom", 4, drawRadialBloom));
		safeCall(() => startExample("gradientFill", 4, drawGradientFill));
		safeCall(() =>
			startExample("audioVisualizerSim", 4, drawAudioVisualizerSim),
		);
		safeCall(() => startExample("labOcean", 6, drawWaveformTerrain));
		safeCall(() => startExample("labHelix", 4, drawDNAHelix));
		safeCall(() => startExample("labPulse", 4, drawRadialBloom));
		safeCall(() => startExample("labOrbit", 3, drawLissajousOrbit));
		safeCall(() => startExample("moireInterference", 4, drawMoireInterference));
		safeCall(() => startExample("kineticTypography", 4, drawKineticTypography));
		safeCall(() => startExample("dampedSine", 4, drawDampedSine));
		safeCall(() => startExample("recursiveSine", 4, drawRecursiveSine));
		safeCall(() => startExample("verticalWave", 4, drawVerticalWave));
		safeCall(() => startExample("dashArray", 4, drawDashArray));
		safeCall(() => startExample("variableWidth", 4, drawVariableWidth));
		safeCall(() => startExample("compositingGlow", 4, drawCompositingGlow));
		safeCall(() => startExample("zenMode", 8, drawZenMode));
		safeCall(() => startStringPhysics());
		safeCall(() => startAudioSpectrogram());
		safeCall(() => startResponsiveResize());
		safeCall(() => startHeroBackground());
		safeCall(() => startPlayground());
		safeCall(() => startRainbowFundamentals());
		safeCall(() => startHeroBackgroundGuide());
		safeCall(() => startScrollReactive());
		safeCall(() => startQualityPresets());
		setupCopyButtons();
		setupViewCodeToggles();
	};

	document.addEventListener("DOMContentLoaded", () => {
		boot();
	});
})();
