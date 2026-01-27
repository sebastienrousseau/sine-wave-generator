<!-- markdownlint-disable MD033 MD041 -->

<img src="https://kura.pro/sinewavegenerator/images/logos/sinewavegenerator.webp"
alt="Sine Wave Generator logo" height="120" align="right" />

<!-- markdownlint-enable MD033 MD041 -->

# Sine Wave Generator

A fast, canvas-first animation engine for smooth, layered sine waves. You get performance-focused defaults, responsive sizing, and a compact API.

<!-- markdownlint-disable MD033 MD041 -->
<center>
<!-- markdownlint-enable MD033 MD041 -->

[![npm version][npm-badge]][02] [![Build Status][build-badge]][05] [![GitHub][github-badge]][06]

• [Website][00] • [Documentation][01] • [Report Bug][03] • [Request Feature][03] • [Contributing Guidelines][04]

<!-- markdownlint-disable MD033 MD041 -->
</center>
<!-- markdownlint-enable MD033 MD041 -->

## Overview 🚀

Sine Wave Generator focuses on:

- Smooth canvas animation with low overhead
- Configurable multi-wave layers for depth
- Responsive sizing with pixel-ratio caps
- Pointer-ready interactions

## Key features 🎯

### Core capabilities

- **⚡ Fast rendering**: Segment-based drawing with capped pixel ratios
- **🎛️ Flexible configuration**: Tune amplitude, wavelength, speed, and easing
- **🧩 Layered waves**: Stack multiple waves for depth and parallax
- **🧭 Responsive sizing**: Uses element bounds with device pixel ratio support
- **🖱️ Pointer control**: Built-in mouse and touch tracking

### Performance features

- **🧮 Memory control**: `maxPixelRatio` limits offscreen buffer size
- **📐 Adjustable detail**: `segmentLength` controls point density
- **🔁 Efficient redraws**: Single animation loop with cached gradients

## Getting started 📦

### Installation

```bash
npm install @sebastienrousseau/sine-wave-generator
```

### Basic usage

```html
<canvas id="sine"></canvas>
<script src="./node_modules/@sebastienrousseau/sine-wave-generator/src/sine-wave-generator.js"></script>
<script>
	const generator = new window.SineWaveGenerator({
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

Note: Set `strokeStyle` to `null` to use the built-in gradient stroke.

## API reference 📖

### Constructor

`new SineWaveGenerator(options)`

| Option          | Type                          | Description                        | Required |
| --------------- | ----------------------------- | ---------------------------------- | -------- |
| `el`            | `HTMLCanvasElement \| string` | Canvas element or selector         | Yes      |
| `waves`         | `WaveConfig[]`                | Initial wave configs               | No       |
| `pixelRatio`    | `number`                      | Override device pixel ratio        | No       |
| `maxPixelRatio` | `number`                      | Cap pixel ratio for memory control | No       |
| `autoResize`    | `boolean`                     | Bind resize handler automatically  | No       |

### WaveConfig

```js
{
  phase?: number,
  speed?: number,
  amplitude?: number,
  wavelength?: number,
  strokeStyle?: string | null,
  segmentLength?: number,
  easing?: (percent, amplitude) => number,
  rotate?: number
}
```

### Instance methods

- `start()` — Start animation.
- `stop()` — Stop animation and unbind listeners.
- `resize()` — Recalculate canvas size and gradients.
- `addWave(config)` — Add a new wave.
- `removeWave(index)` — Remove a wave by index.

Important: If you set a high `maxPixelRatio`, memory use grows quickly on large canvases.

## Examples 📚

Try the examples in `examples/example.html` or the published demos in `docs/index.html`.

## Documentation 📘

- [Website][00]
- [Contributing Guidelines][04]

## Contributing 🤝

We welcome contributions. See the [Contributing Guidelines][04] for details on code standards and pull requests.

## License 📄

This project is licensed under the Apache-2.0 License.

## Acknowledgements 🙏

Thanks to everyone who has contributed to the project.

[00]: https://sine-wave-generator.com
[01]: https://sine-wave-generator.com
[02]: https://www.npmjs.com/package/@sebastienrousseau/sine-wave-generator
[03]: https://github.com/sebastienrousseau/sine-wave-generator/issues
[04]: https://github.com/sebastienrousseau/sine-wave-generator/blob/main/.github/CONTRIBUTING.md
[05]: https://github.com/sebastienrousseau/sine-wave-generator/actions/workflows/release.yml
[06]: https://github.com/sebastienrousseau/sine-wave-generator
[build-badge]: https://img.shields.io/github/actions/workflow/status/sebastienrousseau/sine-wave-generator/release.yml?branch=main&style=for-the-badge&logo=github
[github-badge]: https://img.shields.io/badge/github-sebastienrousseau/sine-wave-generator-8da0cb?style=for-the-badge&labelColor=555555&logo=github
[npm-badge]: https://img.shields.io/npm/v/@sebastienrousseau/sine-wave-generator?style=for-the-badge&logo=npm
