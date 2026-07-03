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
- [React](#react)
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

### Module usage (CommonJS or ESM)

```js
// CommonJS
const { SineWaveGenerator } = require("@sebastienrousseau/sine-wave-generator");
```

```js
// ESM
import { SineWaveGenerator } from "@sebastienrousseau/sine-wave-generator";
```

```js
const generator = new SineWaveGenerator({
	el: "#sine",
	maxPixelRatio: 2,
	waves: [{ amplitude: 26, wavelength: 120, speed: 0.8 }],
});

generator.start();
```

`AudioSync` is available the same way from the `/audio-sync` subpath:

```js
const {
	AudioSync,
} = require("@sebastienrousseau/sine-wave-generator/audio-sync");
// or: import { AudioSync } from "@sebastienrousseau/sine-wave-generator/audio-sync";
```

The package ships both a CommonJS and a native ESM build (resolved automatically via `package.json` `exports`), plus bundled TypeScript types. The deep-import paths used in older versions of these docs — `require("@sebastienrousseau/sine-wave-generator/src/sine-wave-generator.js")` and `.../src/audio-sync.js` — still work unchanged; they resolve straight to the unbundled source.

Set `strokeStyle` to `null` to use the built-in gradient stroke.

### Sync animation to audio (BPM-reactive)

Bind an `AudioSync` instance to a `SineWaveGenerator` so wave parameters react to music in real time — amplitude pulses with bass, speed tracks overall energy, and beats trigger a short amplitude boost.

```js
const { SineWaveGenerator } = require("@sebastienrousseau/sine-wave-generator");
const {
	AudioSync,
} = require("@sebastienrousseau/sine-wave-generator/audio-sync");

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

| Option                 | Type                          | Description                                                                                       | Required |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------- | -------- |
| `el`                   | `HTMLCanvasElement \| string` | Canvas element or CSS selector                                                                    | Yes      |
| `waves`                | `WaveConfig[]`                | Initial wave configurations                                                                       | No       |
| `pixelRatio`           | `number`                      | Override device pixel ratio. Omit to track it automatically, including live display changes       | No       |
| `maxPixelRatio`        | `number`                      | Cap pixel ratio for memory control                                                                | No       |
| `autoResize`           | `boolean`                     | Auto-resize on canvas box changes (`ResizeObserver`) and window resize                            | No       |
| `respectReducedMotion` | `boolean`                     | Honor `prefers-reduced-motion` by scaling animation speed down. Defaults to `true`                | No       |
| `reducedMotionScale`   | `number`                      | Speed multiplier while reduced motion is preferred. Defaults to `0.25`; set to `0` to fully pause | No       |
| `ariaLabel`            | `string \| null`              | Accessible label for the canvas (sets `role="img"`). Omit for decorative canvases (`aria-hidden`) | No       |
| `colorScheme`          | `"auto" \| "light" \| "dark"` | Default gradient palette. `"auto"` follows `prefers-color-scheme` live. Defaults to `"auto"`      | No       |

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

| Method                             | Description                                                           |
| ---------------------------------- | --------------------------------------------------------------------- |
| `start()`                          | Start the animation loop                                              |
| `stop()`                           | Stop the animation loop and unbind events                             |
| `resize()`                         | Recalculate canvas size and rebuild gradients                         |
| `addWave(config)`                  | Add a new wave at runtime                                             |
| `removeWave(index)`                | Remove a wave by index                                                |
| `bindEvents()`                     | Bind resize, mouse, touch, and responsiveness/accessibility listeners |
| `unbindEvents()`                   | Unbind all events and listeners                                       |
| `syncToAudio(audioSync, mapping?)` | Bind an audio source's live metrics to wave parameters                |
| `unsyncAudio()`                    | Detach the bound audio source and restore original wave values        |

A high `maxPixelRatio` on large canvases will increase memory use proportionally.

### Accessibility & responsiveness

By default, `SineWaveGenerator`:

- Marks the canvas `aria-hidden="true"` (it's decorative by default) unless you pass `ariaLabel`, in which case it sets `role="img"` and that label instead — set your own `aria-*` attributes on the element beforehand to opt out.
- Scales animation speed to `reducedMotionScale` (default `0.25`) when the user has `prefers-reduced-motion` enabled, and updates live if that preference changes. Pass `respectReducedMotion: false` to disable, or `reducedMotionScale: 0` to fully pause instead of slowing down.
- Tracks `devicePixelRatio` live via a `matchMedia` listener when `pixelRatio` isn't explicitly set, so moving the window to a display with different pixel density stays sharp.
- Observes the canvas element itself with `ResizeObserver` (in addition to the window `resize` event) when `autoResize` is `true`, so layout-driven size changes — not just window resizes — are picked up automatically.
- Picks the default gradient's palette from `prefers-color-scheme` (a cooler, higher-contrast palette for dark backgrounds) and updates live if the OS/browser theme changes, when using the built-in gradient (`strokeStyle: null`). Pass `colorScheme: "light"` or `"dark"` to force a palette instead of following the system preference.

```js
const generator = new SineWaveGenerator({
	el: "#sine",
	ariaLabel: "Ambient background animation",
	reducedMotionScale: 0, // fully pause instead of slowing down
});
```

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

**Beat detection is a lightweight heuristic, not a validated DSP algorithm.** It's a variance-thresholded energy detector on the bass band alone — cheap enough to run once per animation frame, but it under-detects material whose rhythm isn't bass-driven (ambient, classical, sparse/syncopated percussion), and only reports a `bpm` once two or more beats land 60--200 BPM apart. See the `detectBeat()` JSDoc in `src/audio-sync.js` for the full algorithm basis and limitations. For more robust detection, pass a known `bpm` manually, or pair `AudioSync` with a dedicated analysis library (e.g. `realtime-bpm-analyzer`, `web-audio-beat-detector`, or `Meyda` for richer spectral features) and feed its output through a custom object exposing `update(timestampMs)`.

<p align="right"><a href="#sine-wave-generator--smooth-canvas-animation">Back to Top</a></p>

---

## React

An optional `useSineWaveGenerator` hook is available from the `/use-sine-wave-generator` subpath (raw source, not bundled — `react` is a peer dependency, only required if you import this). It creates the generator on mount, starts it, and destroys it on unmount.

```jsx
import { useSineWaveGenerator } from "@sebastienrousseau/sine-wave-generator/use-sine-wave-generator";

function AmbientBackground() {
	const { canvasRef } = useSineWaveGenerator({
		waves: [{ amplitude: 20, wavelength: 120, speed: 0.5 }],
		ariaLabel: "Ambient background animation",
	});
	return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}
```

The hook is intentionally thin: it creates the generator once from the options passed on the first render (a new `waves` array on a later render calls `setWaves()` automatically), and returns `generatorRef` as an escape hatch — call any instance method on `generatorRef.current` (`addWave`, `syncToAudio`, `setQualityPreset`, ...) for anything else you need to update imperatively.

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
