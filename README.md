<!-- markdownlint-disable MD033 MD041 -->

<p align="right">
  <img src="https://kura.pro/sinewavegenerator/images/logos/sinewavegenerator.webp" alt="Sine Wave Generator logo" width="64" />
</p>

<!-- markdownlint-enable MD033 MD041 -->

# Sine Wave Generator — Smooth Canvas Animation

[![Build](https://img.shields.io/github/actions/workflow/status/sebastienrousseau/sine-wave-generator/release.yml?style=for-the-badge)](https://github.com/sebastienrousseau/sine-wave-generator/actions) [![Version](https://img.shields.io/badge/Version-v0.0.3-blue?style=for-the-badge)](https://github.com/sebastienrousseau/sine-wave-generator/releases/tag/v0.0.3) [![License](https://img.shields.io/badge/License-Apache--2.0-green.svg?style=for-the-badge)](LICENSE) [![npm](https://img.shields.io/npm/v/@sebastienrousseau/sine-wave-generator?style=for-the-badge)](https://www.npmjs.com/package/@sebastienrousseau/sine-wave-generator) [![Last Commit](https://img.shields.io/github/last-commit/sebastienrousseau/sine-wave-generator?style=for-the-badge)](https://github.com/sebastienrousseau/sine-wave-generator/commits)

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

### Performance

- **Memory control.** `maxPixelRatio` limits the offscreen buffer size on high-DPI screens.
- **Adjustable detail.** `segmentLength` controls point density for smooth or fast rendering.
- **Efficient redraws.** A single animation loop with cached gradients minimises per-frame overhead.

---

## Get started

### Installation

```bash
npm install @sebastienrousseau/sine-wave-generator
```

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

<p align="right"><a href="#sine-wave-generator--smooth-canvas-animation">Back to Top</a></p>

---

## API reference

### Constructor

`new SineWaveGenerator(options)`

| Option | Type | Description | Required |
|---|---|---|---|
| `el` | `HTMLCanvasElement \| string` | Canvas element or CSS selector | Yes |
| `waves` | `WaveConfig[]` | Initial wave configurations | No |
| `pixelRatio` | `number` | Override device pixel ratio | No |
| `maxPixelRatio` | `number` | Cap pixel ratio for memory control | No |
| `autoResize` | `boolean` | Bind a resize handler automatically | No |

### WaveConfig

| Property | Type | Default | Description |
|---|---|---|---|
| `phase` | `number` | Random | Phase offset in radians |
| `speed` | `number` | Random 0.5 -- 1.0 | Animation speed multiplier |
| `amplitude` | `number` | `10` | Wave height in pixels |
| `wavelength` | `number` | `100` | Peak-to-peak distance in pixels |
| `strokeStyle` | `string \| null` | `null` | CSS colour or `null` for gradient |
| `segmentLength` | `number` | `10` | Point density (lower is smoother) |
| `easing` | `function` | `Ease.sineInOut` | Easing curve for wave shape |
| `rotate` | `number` | `0` | Rotation angle in degrees (0 -- 359) |

### Instance methods

| Method | Description |
|---|---|
| `start()` | Start the animation loop |
| `stop()` | Stop the animation loop and unbind events |
| `resize()` | Recalculate canvas size and rebuild gradients |
| `addWave(config)` | Add a new wave at runtime |
| `removeWave(index)` | Remove a wave by index |
| `bindEvents()` | Bind resize, mouse, and touch events |
| `unbindEvents()` | Unbind all events |

A high `maxPixelRatio` on large canvases will increase memory use proportionally.

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
} from "@sebastienrousseau/sine-wave-generator";
```

---

## Contributing

Please read [CONTRIBUTING.md](.github/CONTRIBUTING.md) before opening a pull request.

For security issues, see [SECURITY.md](.github/SECURITY.md).

---

## License

This project is licensed under the **Apache-2.0 License**. See [LICENSE](LICENSE).
