<!-- markdownlint-disable MD033 MD041 -->

<p align="right">
  <img src="https://kura.pro/sinewavegenerator/images/logos/sinewavegenerator.webp" alt="Sine Wave Generator logo" width="64" />
</p>

<!-- markdownlint-enable MD033 MD041 -->

# Sine Wave Generator — Smooth Canvas Animation

[![Build](https://img.shields.io/github/actions/workflow/status/sebastienrousseau/sine-wave-generator/release.yml?style=for-the-badge)](https://github.com/sebastienrousseau/sine-wave-generator/actions) [![Version](https://img.shields.io/badge/Version-v0.0.3-blue?style=for-the-badge)](https://github.com/sebastienrousseau/sine-wave-generator/releases/tag/v0.0.3) [![License](https://img.shields.io/badge/License-Apache--2.0-green.svg?style=for-the-badge)](LICENSE) [![npm](https://img.shields.io/npm/v/@sebastienrousseau/sine-wave-generator?style=for-the-badge)](https://www.npmjs.com/package/@sebastienrousseau/sine-wave-generator) [![Bundle size](https://img.shields.io/bundlephobia/minzip/@sebastienrousseau/sine-wave-generator?style=for-the-badge&label=gzip%20size)](https://bundlephobia.com/package/@sebastienrousseau/sine-wave-generator) [![Last Commit](https://img.shields.io/github/last-commit/sebastienrousseau/sine-wave-generator?style=for-the-badge)](https://github.com/sebastienrousseau/sine-wave-generator/commits)

---

## Overview

Render animated sine waves on a canvas element with minimal configuration. Sine Wave Generator is a performance-focused JavaScript library that draws smooth, layered waveforms at a steady 60 fps with zero dependencies.

The library ships at roughly 3 KB gzipped. It uses `requestAnimationFrame` for battery-efficient rendering, caps pixel ratios for memory control, and supports pointer interactions out of the box.

---

## Table of contents

- [Overview](#overview)
- [Key features](#key-features)
- [Get started](#get-started)
- [API reference](#api-reference)
- [Examples](#examples)
- [TypeScript](#typescript)
- [Contributing](#contributing)
- [License](#license)

---

## Key features

### Core capabilities

- **Fast rendering.** Segment-based drawing with capped pixel ratios keeps frame budgets tight.
- **Flexible configuration.** Tune amplitude, wavelength, speed, and easing to match any visual style.
- **Layered waves.** Stack multiple waves with independent settings for depth and parallax.
- **Responsive sizing.** Element-bound dimensions with device pixel ratio support and a configurable cap.
- **Pointer control.** Built-in mouse and touch tracking adjusts wave phase in real time.
- **Audio-reactive sync.** Bind a live audio source so wave amplitude, speed, and rotation react to beats, tempo, and frequency energy.

### Performance

- **Memory control.** `maxPixelRatio` limits the offscreen buffer size on high-DPI screens.
- **Adjustable detail.** `segmentLength` controls point density for smooth or fast rendering.
- **Efficient redraws.** A single animation loop with cached gradients minimises per-frame overhead.

---

## Get started

### Installation

```bash
npm install @sebastienrousseau/sine-wave-generator
# or
yarn add @sebastienrousseau/sine-wave-generator
# or
pnpm add @sebastienrousseau/sine-wave-generator
```

### Requirements

- **Browser:** any evergreen browser with Canvas 2D support (Chrome, Firefox, Safari, Edge). `AudioSync` additionally requires the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (supported in all evergreen browsers).
- **Node.js:** `>=16` — only relevant for the build/test tooling in this repo; the published package is plain browser JavaScript with zero runtime dependencies.
- No bundler or build step is required to consume the library: drop `src/sine-wave-generator.js` in with a `<script>` tag, or `require`/`import` it directly.

### Basic usage

```html
<canvas id="sine"></canvas>
<script src="./node_modules/@sebastienrousseau/sine-wave-generator/src/sine-wave-generator.js"></script>
<script>
	const generator = new SineWaveGenerator({
		el: "#sine",
		maxPixelRatio: 2,
		waves: [{ amplitude: 26, wavelength: 120, speed: 0.8 }],
	});

	generator.start();
</script>
```

### Module usage (CommonJS)

```js
const {
	SineWaveGenerator,
} = require("@sebastienrousseau/sine-wave-generator/src/sine-wave-generator.js");

const generator = new SineWaveGenerator({
	el: "#sine",
	maxPixelRatio: 2,
	waves: [{ amplitude: 26, wavelength: 120, speed: 0.8 }],
});

generator.start();
```

Set `strokeStyle` to `null` to use the built-in gradient stroke.

### Sync animation to audio (BPM-reactive)

Bind an `AudioSync` instance to a `SineWaveGenerator` so wave parameters react to music in real time — amplitude pulses with bass, speed tracks overall energy, and beats trigger a short amplitude boost.

```js
const {
	SineWaveGenerator,
} = require("@sebastienrousseau/sine-wave-generator/src/sine-wave-generator.js");
const {
	AudioSync,
} = require("@sebastienrousseau/sine-wave-generator/src/audio-sync.js");

const generator = new SineWaveGenerator({
	el: "#sine",
	waves: [{ amplitude: 20, wavelength: 120, speed: 0.5 }],
});

const audioSync = new AudioSync(); // or new AudioSync({ bpm: 128 }) for a known tempo
const audioEl = document.querySelector("audio");
audioEl.addEventListener(
	"play",
	() => {
		audioSync.connect(audioEl); // also accepts a MediaStream, e.g. from getUserMedia()
		generator.syncToAudio(audioSync);
	},
	{ once: true },
);

generator.start();
```

Pass a custom `mapping` as the second argument to `syncToAudio()` to control which metric (`"energy"`, `"bass"`, `"mid"`, `"treble"`) drives which wave property (`amplitude`, `speed`, `rotate`), and how strongly:

```js
generator.syncToAudio(audioSync, {
	amplitude: { source: "bass", intensity: 2 },
	speed: { source: "energy", intensity: 1 },
	rotate: { source: "treble", intensity: 0.5 },
});
```

Call `generator.unsyncAudio()` to detach and restore each wave's original amplitude, speed, and rotation.

<p align="right"><a href="#sine-wave-generator--smooth-canvas-animation">Back to Top</a></p>

---

## API reference

### Constructor

`new SineWaveGenerator(options)`

| Option          | Type                          | Description                         | Required |
| --------------- | ----------------------------- | ----------------------------------- | -------- |
| `el`            | `HTMLCanvasElement \| string` | Canvas element or CSS selector      | Yes      |
| `waves`         | `WaveConfig[]`                | Initial wave configurations         | No       |
| `pixelRatio`    | `number`                      | Override device pixel ratio         | No       |
| `maxPixelRatio` | `number`                      | Cap pixel ratio for memory control  | No       |
| `autoResize`    | `boolean`                     | Bind a resize handler automatically | No       |

### WaveConfig

| Property        | Type             | Default           | Description                          |
| --------------- | ---------------- | ----------------- | ------------------------------------ |
| `phase`         | `number`         | Random            | Phase offset in radians              |
| `speed`         | `number`         | Random 0.5 -- 1.0 | Animation speed multiplier           |
| `amplitude`     | `number`         | `10`              | Wave height in pixels                |
| `wavelength`    | `number`         | `100`             | Peak-to-peak distance in pixels      |
| `strokeStyle`   | `string \| null` | `null`            | CSS colour or `null` for gradient    |
| `segmentLength` | `number`         | `10`              | Point density (lower is smoother)    |
| `easing`        | `function`       | `Ease.sineInOut`  | Easing curve for wave shape          |
| `rotate`        | `number`         | `0`               | Rotation angle in degrees (0 -- 359) |

### Instance methods

| Method                             | Description                                                    |
| ---------------------------------- | -------------------------------------------------------------- |
| `start()`                          | Start the animation loop                                       |
| `stop()`                           | Stop the animation loop and unbind events                      |
| `resize()`                         | Recalculate canvas size and rebuild gradients                  |
| `addWave(config)`                  | Add a new wave at runtime                                      |
| `removeWave(index)`                | Remove a wave by index                                         |
| `bindEvents()`                     | Bind resize, mouse, and touch events                           |
| `unbindEvents()`                   | Unbind all events                                              |
| `syncToAudio(audioSync, mapping?)` | Bind an audio source's live metrics to wave parameters         |
| `unsyncAudio()`                    | Detach the bound audio source and restore original wave values |

A high `maxPixelRatio` on large canvases will increase memory use proportionally.

### AudioSync

`new AudioSync(options?)` — analyzes an `HTMLMediaElement` or `MediaStream` with the Web Audio API and derives real-time metrics for `syncToAudio()`.

| Option                  | Type             | Default | Description                                    |
| ----------------------- | ---------------- | ------- | ---------------------------------------------- |
| `fftSize`               | `number`         | `1024`  | FFT size for the analyser (must be power of 2) |
| `smoothingTimeConstant` | `number`         | `0.8`   | Analyser smoothing, 0--1                       |
| `bpm`                   | `number \| null` | `null`  | Manual tempo override; omit to auto-detect     |

| Method                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `connect(source)`     | Connect an `HTMLMediaElement` or `MediaStream`    |
| `disconnect()`        | Disconnect and reset analysis state               |
| `update(timestampMs)` | Sample the source and refresh metrics             |
| `getMetrics()`        | Return the last computed metrics without sampling |

Metrics returned by `update()`/`getMetrics()`: `energy`, `bass`, `mid`, `treble` (all normalized 0--1), `beat` (boolean, true on the detected frame), `beatPhase` (0--1 progress through the current beat), and `bpm` (manual or auto-detected tempo, or `null` if unknown).

<p align="right"><a href="#sine-wave-generator--smooth-canvas-animation">Back to Top</a></p>

---

## Examples

Open `docs/index.html` for a full interactive demo covering:

- Fundamental wave controls (amplitude, wavelength, easing, pause/resume)
- Pattern examples (pulse matrix, DNA helix, fluid column, Lissajous orbits)
- Advanced modes (Moire interference, kinetic typography, damped sine)
- A live playground with presets and configurable parameters

---

## TypeScript

Type definitions ship with the package.

```ts
import {
	SineWaveGenerator,
	Wave,
	Ease,
	WaveConfig,
	SineWaveGeneratorOptions,
	AudioSync,
	AudioSyncOptions,
	AudioMapping,
	AudioMetrics,
	ValidationError,
	CanvasError,
	AudioSyncError,
} from "@sebastienrousseau/sine-wave-generator";
```

Every error thrown by this library is one of `ValidationError`, `CanvasError`, or `AudioSyncError` (all extend `Error`), so you can discriminate failure modes with `instanceof` instead of matching on message strings:

```ts
try {
	new SineWaveGenerator({ el: "#missing-canvas" });
} catch (error) {
	if (error instanceof CanvasError) {
		// canvas element or its 2D context is missing/unusable
	}
	throw error;
}
```

---

## Contributing

Please read [CONTRIBUTING.md](.github/CONTRIBUTING.md) before opening a pull request.

For security issues, see [SECURITY.md](.github/SECURITY.md).

---

## License

This project is licensed under the **Apache-2.0 License**. See [LICENSE](LICENSE).
